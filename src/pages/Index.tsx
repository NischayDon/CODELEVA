import { useGameStore } from '@/store/gameStore';
import MainMenu from '@/components/game/MainMenu';
import Workshop from '@/components/game/Workshop';
import { Helmet } from 'react-helmet-async';

const Index = () => {
  const { currentScreen } = useGameStore();

  const renderScreen = () => {
    switch (currentScreen) {
      case 'menu':
        return <MainMenu />;
      case 'workshop':
        return <Workshop />;
      default:
        return <MainMenu />;
    }
  };

  return (
    <>
      <Helmet>
        <title>CodeLeva Quest - Learn Python & C++ Through PC Building</title>
        <meta name="description" content="An immersive 3D educational game where you build a virtual PC while learning Python and C++ programming concepts. Each component teaches a new coding skill!" />
      </Helmet>
      {renderScreen()}
    </>
  );
};

export default Index;
