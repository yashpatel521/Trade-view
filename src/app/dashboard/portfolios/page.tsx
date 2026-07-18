import { getAllPortfoliosAction, getFxRateAction } from '@/lib/actions/trading';
import PortfoliosClient from './PortfoliosClient';

export default async function PortfoliosPage() {
  const portfolios = await getAllPortfoliosAction();
  const fxRate = await getFxRateAction();

  return <PortfoliosClient portfolios={portfolios} fxRate={fxRate} />;
}
