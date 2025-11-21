import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CreditCard, Banknote } from 'lucide-react';

interface PaymentModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    total: number;
    onComplete: (method: string, details?: any) => Promise<void>;
}

export default function PaymentModal({ open, onOpenChange, total, onComplete }: PaymentModalProps) {
    const [method, setMethod] = useState<'CASH' | 'CARD' | null>(null);
    const [cashTendered, setCashTendered] = useState('');
    const [processing, setProcessing] = useState(false);

    const handlePayment = async () => {
        setProcessing(true);
        try {
            // Simulate network delay for card
            if (method === 'CARD') {
                await new Promise(resolve => setTimeout(resolve, 1500));
            }

            await onComplete(method!, {
                tendered: method === 'CASH' ? Number(cashTendered) : total,
                change: method === 'CASH' ? Number(cashTendered) - total : 0
            });
            onOpenChange(false);
        } catch (error) {
            console.error('Payment failed', error);
        } finally {
            setProcessing(false);
            setMethod(null);
            setCashTendered('');
        }
    };

    const change = Number(cashTendered) - total;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Payment - Total: ${total.toFixed(2)}</DialogTitle>
                </DialogHeader>

                {!method ? (
                    <div className="grid grid-cols-2 gap-4 py-4">
                        <Button
                            variant="outline"
                            className="h-24 flex flex-col gap-2"
                            onClick={() => setMethod('CASH')}
                        >
                            <Banknote className="h-8 w-8" />
                            Cash
                        </Button>
                        <Button
                            variant="outline"
                            className="h-24 flex flex-col gap-2"
                            onClick={() => setMethod('CARD')}
                        >
                            <CreditCard className="h-8 w-8" />
                            Card
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-4 py-4">
                        <div className="flex justify-between items-center mb-4">
                            <Button variant="ghost" onClick={() => setMethod(null)}>← Back</Button>
                            <span className="font-bold">{method} Payment</span>
                        </div>

                        {method === 'CASH' && (
                            <div className="space-y-2">
                                <Label>Amount Tendered</Label>
                                <Input
                                    type="number"
                                    value={cashTendered}
                                    onChange={(e) => setCashTendered(e.target.value)}
                                    autoFocus
                                />
                                {Number(cashTendered) >= total && (
                                    <div className="text-green-600 font-bold text-lg text-right">
                                        Change: ${change.toFixed(2)}
                                    </div>
                                )}
                            </div>
                        )}

                        {method === 'CARD' && (
                            <div className="text-center py-8">
                                <p>Please tap or insert card on terminal...</p>
                            </div>
                        )}

                        <Button
                            className="w-full"
                            onClick={handlePayment}
                            disabled={
                                processing ||
                                (method === 'CASH' && Number(cashTendered) < total)
                            }
                        >
                            {processing ? 'Processing...' : 'Complete Payment'}
                        </Button>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
