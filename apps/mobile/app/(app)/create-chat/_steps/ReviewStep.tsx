import { Button, Title, Text } from '@/components';
import { StepContent, Options, ReviewRow, ReviewKey, ReviewValue, Actions } from '../_styles';
import { WizardConfig } from '../_types';

interface Props {
  config: WizardConfig;
  loading: boolean;
  error?: string;
  onSubmit: () => void;
  onBack: () => void;
}

export function ReviewStep({ config, loading, error, onSubmit, onBack }: Props) {
  return (
    <StepContent>
      <Title size="lg">// review</Title>
      <Options>
        <ReviewRow><ReviewKey>name</ReviewKey><ReviewValue>{config.name}</ReviewValue></ReviewRow>
        <ReviewRow><ReviewKey>alphabet</ReviewKey><ReviewValue>{config.alphabet}</ReviewValue></ReviewRow>
        <ReviewRow><ReviewKey>substitution</ReviewKey><ReviewValue>{config.manualSubstitutionMap ? 'manual' : (config.substitution ?? 'skip')}</ReviewValue></ReviewRow>
        <ReviewRow><ReviewKey>homophones</ReviewKey><ReviewValue>{config.homophones ? 'auto' : 'skip'}</ReviewValue></ReviewRow>
        <ReviewRow><ReviewKey>space</ReviewKey><ReviewValue>{config.space ? 'auto' : 'skip'}</ReviewValue></ReviewRow>
        <ReviewRow><ReviewKey>null symbols</ReviewKey><ReviewValue>{config.nullSymbols ? 'auto' : 'skip'}</ReviewValue></ReviewRow>
      </Options>
      {error && <Text error size="sm">{error}</Text>}
      <Actions>
        <Button title="create chat" onClick={onSubmit} loading={loading} />
        <Button title="back" onClick={onBack} variant="secondary" />
      </Actions>
    </StepContent>
  );
}
