import { useState } from 'react';
import { KeyboardAvoidingView, Platform } from 'react-native';
import { router } from 'expo-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AlphabetType, SubstitutionMode, Vocabulary, randomSubstitutionLayer, randomHomophoneLayer, randomSpaceLayer, randomNullLayer } from '@noiseroom/cipher';
import { api } from '@/lib/api';
import { encryptVocabulary, saveVocabularyLocally } from '@/lib/vault';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setVocabulary } from '@/store/vocabularies.slice';
import { WizardConfig } from './_types';
import { Container, Header, Body, StepIndicator, StepDot } from './_styles';
import { Button } from '@/components';
import { NameStep } from './_steps/NameStep';
import { AlphabetStep } from './_steps/AlphabetStep';
import { SubstitutionStep } from './_steps/SubstitutionStep';
import { HomophonesStep } from './_steps/HomophonesStep';
import { SpaceStep } from './_steps/SpaceStep';
import { NullSymbolsStep } from './_steps/NullSymbolsStep';
import { ReviewStep } from './_steps/ReviewStep';

const TOTAL_STEPS = 7;

const INITIAL_CONFIG: WizardConfig = {
  name: '',
  alphabet: null,
  substitution: null,
  homophones: false,
  space: false,
  nullSymbols: false,
};

function buildVocabulary(config: WizardConfig): Vocabulary {
  const alphabet = config.alphabet!;
  let charMap: Record<string, string[]> = {};
  let nullSymbols: string[] = [];

  if (config.substitution) {
    charMap = randomSubstitutionLayer(alphabet, config.substitution);
  }
  if (config.homophones && Object.keys(charMap).length > 0) {
    charMap = randomHomophoneLayer(charMap, alphabet);
  }
  if (config.space) {
    charMap = randomSpaceLayer(charMap, alphabet);
  }
  if (config.nullSymbols) {
    nullSymbols = randomNullLayer(charMap, alphabet);
  }

  return { alphabet, charMap, nullSymbols };
}

interface Chat {
  id: string;
  name: string;
}

export default function CreateChatScreen() {
  const dispatch = useAppDispatch();
  const pin = useAppSelector((state) => state.auth.pin)!;
  const queryClient = useQueryClient();

  const [step, setStep] = useState(0);
  const [config, setConfig] = useState<WizardConfig>(INITIAL_CONFIG);

  function next() {
    setStep((s) => s + 1);
  }

  function update<K extends keyof WizardConfig>(key: K, value: WizardConfig[K]) {
    setConfig((c) => ({ ...c, [key]: value }));
    next();
  }

  const { mutate, isPending, error } = useMutation({
    mutationFn: async () => {
      const vocabulary = buildVocabulary(config);
      const encryptedVocabulary = encryptVocabulary(vocabulary, pin);
      const chat = await api.fetch<Chat>('/chats', {
        method: 'POST',
        body: JSON.stringify({ name: config.name, encryptedVocabulary }),
      });
      return { chat, vocabulary };
    },
    onSuccess: async ({ chat, vocabulary }) => {
      await saveVocabularyLocally(chat.id, vocabulary, pin);
      dispatch(setVocabulary({ chatId: chat.id, vocabulary }));
      queryClient.invalidateQueries({ queryKey: ['chats'] });
      router.replace(`/(app)/chat/${chat.id}`);
    },
  });

  const steps = [
    <NameStep key="name" value={config.name} onNext={(name) => update('name', name)} />,
    <AlphabetStep key="alphabet" value={config.alphabet} onNext={(alphabet: AlphabetType) => update('alphabet', alphabet)} />,
    <SubstitutionStep key="substitution" value={config.substitution} onNext={(substitution: SubstitutionMode | null) => update('substitution', substitution)} />,
    <HomophonesStep key="homophones" value={config.homophones} onNext={(homophones) => update('homophones', homophones)} />,
    <SpaceStep key="space" value={config.space} onNext={(space) => update('space', space)} />,
    <NullSymbolsStep key="nullSymbols" value={config.nullSymbols} onNext={(nullSymbols) => update('nullSymbols', nullSymbols)} />,
    <ReviewStep
      key="review"
      config={config}
      loading={isPending}
      error={error instanceof Error ? error.message : undefined}
      onSubmit={() => mutate()}
      onBack={() => setStep((s) => s - 1)}
    />,
  ];

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
      <Container>
        <Header>
          <StepIndicator>
            {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
              <StepDot key={i} active={i === step} done={i < step}>
                {i === step ? `[${i + 1}]` : `·${i + 1}·`}
              </StepDot>
            ))}
          </StepIndicator>
          <Button title="×" onClick={() => router.back()} variant="secondary" size="sm" />
        </Header>
        <Body>
          {steps[step]}
        </Body>
      </Container>
    </KeyboardAvoidingView>
  );
}
