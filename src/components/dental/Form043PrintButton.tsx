import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';
import { useClinic } from '@/context/ClinicContext';
import { Form043Editor } from '@/components/forms/Form043Editor';

interface Form043PrintButtonProps {
  className?: string;
}

export function Form043PrintButton({ className }: Form043PrintButtonProps) {
  const { selectedPatientId } = useClinic();
  const [open, setOpen] = useState(false);

  if (!selectedPatientId) return null;

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        className={className}
        title="Відкрити та заповнити форму 043/О"
      >
        <Printer className="w-4 h-4 mr-2" />
        Форма 043
      </Button>
      {open && <Form043Editor onClose={() => setOpen(false)} />}
    </>
  );
}
