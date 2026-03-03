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
import bgImage from '@/assets/back.jpg';


const Index = () => {
  const { currentUser } = useAuth();
  const { selectedPatientId } = useClinic();
  const isMobile = useIsMobile();
  const [showChart, setShowChart] = useState(false);

  if (!currentUser) {
    return <LoginPage />;
  }

  if (isMobile) {
    return (
      <div className="min-h-screen flex flex-col bg-background/50">
        <Header />
        <div
          className="fixed inset-0 -z-10 bg-cover bg-center bg-no-repeat pointer-events-none opacity-15"
          style={{ backgroundImage: `url(${bgImage})` }}
        />
        <div className="relative min-h-screen flex flex-col bg-background/30 backdrop-blur-sm">
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
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background/50">
      <Header />
      {/* fixed — картинка залишається на місці при скролі */}
      <div
        className="fixed inset-0 -z-10 bg-cover bg-center bg-no-repeat pointer-events-none opacity-15"
        style={{ backgroundImage: `url(${bgImage})` }}
      />
      <div className="relative min-h-screen flex flex-col bg-background/50 backdrop-blur-sm">
        <main className="flex-1 flex flex-col md:flex-row p-2 md:p-4 gap-2 md:gap-4 overflow-hidden">
          <PatientList />
          <DentalChart />
        </main>
      </div>
    </div>
  );
};

export default Index;
