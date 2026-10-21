import { NextPage } from 'next';
import { MovingQuoteForm } from '@/components/MovingQuoteForm';

const HomePage: NextPage = () => {
  return (
    <main className="flex flex-col items-center">
      <MovingQuoteForm />
    </main >
  );
};

export default HomePage;
