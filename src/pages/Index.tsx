import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useClinic } from '@/context/ClinicContext';
import { LoginPage } from '@/components/auth/LoginPage';
import { Header } from '@/components/layout/Header';
import { PatientList } from '@/components/patients/PatientList';
import { DentalChart } from '@/components/dental/DentalChart';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';

const Index = () => {
  const { currentUser } = useAuth();
  const { selectedPatientId } = useClinic();
  const isMobile = useIsMobile();
  const [showChart, setShowChart] = useState(false);

  if (!currentUser) {
    return <LoginPage />;
  }

  // Mobile: show patient list by default, dental chart when patient selected
  if (isMobile) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 flex flex-col p-2 overflow-hidden">
          {showChart && selectedPatientId ? (
            <>
              <Button
                variant="ghost"
                size="sm"
                className="mb-2 self-start"
                onClick={() => setShowChart(false)}
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Список пацієнтів
              </Button>
              <DentalChart />
            </>
          ) : (
            <PatientList onPatientSelect={() => setShowChart(true)} />
          )}
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 overflow-hidden p-4">
        <ResizablePanelGroup direction="horizontal" className="h-full rounded-lg">
          <ResizablePanel defaultSize={30} minSize={20} maxSize={50}>
            <PatientList />
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={70} minSize={40}>
            <DentalChart />
          </ResizablePanel>
        </ResizablePanelGroup>
      </main>
    </div>
  );
};

export default Index;
