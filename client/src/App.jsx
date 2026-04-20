import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { SessionProvider } from './context/SessionContext';
import Home from './pages/Home';
import CreateSession from './pages/CreateSession';
import SessionLobby from './pages/SessionLobby';
import Receipts from './pages/Receipts';
import AddReceipt from './pages/AddReceipt';
import EditItems from './pages/EditItems';
import AssignSplits from './pages/AssignSplits';
import SplitsOverview from './pages/SplitsOverview';
import FinalReview from './pages/FinalReview';
import PaymentMethods from './pages/PaymentMethods';
import ReceiptDetail from './pages/ReceiptDetail';
import Settlement from './pages/Settlement';

export default function App() {
  return (
    <SessionProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/create" element={<CreateSession initialMode="create" />} />
          <Route path="/join" element={<CreateSession initialMode="join" />} />

          <Route path="/session/:id" element={<SessionLobby />} />
          <Route path="/session/:id/receipts" element={<Receipts />} />
          <Route path="/session/:id/receipts/add" element={<AddReceipt />} />
          <Route path="/session/:id/receipts/:receiptId" element={<ReceiptDetail />} />
          <Route path="/session/:id/receipts/:receiptId/edit" element={<EditItems />} />
          <Route path="/session/:id/receipts/:receiptId/splits" element={<AssignSplits />} />
          <Route path="/session/:id/splits" element={<SplitsOverview />} />
          <Route path="/session/:id/review" element={<FinalReview />} />
          <Route path="/session/:id/payment-methods" element={<PaymentMethods />} />
          <Route path="/session/:id/settle" element={<Settlement />} />
        </Routes>
      </BrowserRouter>
    </SessionProvider>
  );
}
