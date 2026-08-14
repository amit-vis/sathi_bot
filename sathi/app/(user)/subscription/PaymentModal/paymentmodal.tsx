import { CloseIcon, WhatsAppIcon } from "./configbutton";

export function PaymentModal({ plan, onClose }: { plan: any; onClose: () => void }) {
  
  const handlePaymentConfirmation = () => {
    // Apna WhatsApp business number yahan daal dena
    const phoneNumber = "91XXXXXXXXXX"; 
    const message = `Hi, I have completed the payment of ₹${plan.total} for the ${plan.name}. Please confirm my subscription.`;
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    
    window.open(whatsappUrl, "_blank");
    onClose(); 
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-3xl border border-line bg-surface p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
        
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-muted hover:text-ink transition-colors"
        >
          <CloseIcon />
        </button>

        <h2 className="text-2xl font-semibold text-ink text-center mt-2">Complete Payment</h2>
        
        <div className="mt-6 p-4 rounded-2xl bg-surface-2 border border-line space-y-3">
          <div className="flex justify-between text-sm text-muted">
            <span>{plan.name}</span>
            <span>₹{plan.price}</span>
          </div>
          <div className="flex justify-between text-sm text-muted pb-3 border-b border-line">
            <span>Taxes & Delivery</span>
            <span>₹{plan.sub_price}</span>
          </div>
          <div className="flex justify-between text-lg font-bold text-ink pt-1">
            <span>Total Amount</span>
            <span>₹{plan.total}</span>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center">
          <p className="text-sm text-muted mb-4">Scan QR to pay via UPI</p>
          <div className="w-48 h-48 bg-white p-2 rounded-xl flex items-center justify-center">
            <img 
              src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi://pay?pa=yourupi@bank&pn=ArushEggs&am=0" 
              alt="Payment QR" 
              className="w-full h-full object-contain opacity-50" 
            />
          </div>
        </div>

        <button 
          onClick={handlePaymentConfirmation}
          className="shine-edges mt-8 flex h-14 w-full items-center justify-center gap-3 rounded-full bg-whatsapp text-base font-semibold text-white shadow-glow-green transition-transform active:scale-[0.98]"
        >
          <WhatsAppIcon />
          I have paid, Confirm on WhatsApp
        </button>
      </div>
    </div>
  );
}