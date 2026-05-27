import { useState } from 'react';
import { Button, Input, Title } from '@/components';
import { StepContent, Actions } from '../_styles';

interface Props {
  value: string;
  onNext: (name: string) => void;
}

export function NameStep({ value, onNext }: Props) {
  const [name, setName] = useState(value);

  return (
    <StepContent>
      <Title size="lg">// chat name</Title>
      <Input
        label="name"
        value={name}
        onChange={setName}
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="done"
        onSubmitEditing={() => name.trim() && onNext(name.trim())}
      />
      <Actions>
        <Button title="next" onClick={() => name.trim() && onNext(name.trim())} />
      </Actions>
    </StepContent>
  );
}
