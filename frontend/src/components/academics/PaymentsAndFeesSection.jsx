import React, { useState } from 'react';
import {
  CreditCard,
  Receipt,
  Download,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ShieldCheck,
  Building2,
  Copy,
  Check,
  QrCode,
  DollarSign,
  ArrowRight,
  ExternalLink,
  Printer,
  FileText,
  Sparkles,
  HelpCircle,
  Smartphone,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../ui/Card';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import Modal from '../ui/Modal';
import { useToast } from '../ui/Toast';
import { COLLEGE_BANK_DETAILS } from '../../data/paymentsData.js';

export default function PaymentsAndFeesSection({
  selectedSem,
  onSelectSem,
  user,
  feeSchedule,
  onUpdateFeeSchedule,
}) {
  const { addToast } = useToast();

  const [copiedKey, setCopiedKey] = useState(null);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [isBankDetailsOpen, setIsBankDetailsOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [payAmountType, setPayAmountType] = useState('full');
  const [customPayAmount, setCustomPayAmount] = useState('');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Current semester fee object
  const currentFee = feeSchedule[selectedSem] || {
    semester: `${selectedSem}th Semester`,
    academicYear: '2026 - 2027',
    term: `Semester ${selectedSem}`,
    dueDate: 'TBA',
    status: 'Upcoming',
    amountDue: 0,
    amountPaid: 0,
    totalPayable: 0,
    breakdown: [],
    scholarship: null,
    paymentHistory: [],
  };

  // Aggregates across all semesters
  const aggregateStats = Object.values(feeSchedule).reduce(
    (acc, sem) => {
      acc.totalPaid += sem.amountPaid || 0;
      acc.totalDue += sem.amountDue || 0;
      acc.receiptsCount += (sem.paymentHistory || []).length;
      return acc;
    },
    { totalPaid: 0, totalDue: 0, receiptsCount: 0 }
  );

  const copyToClipboard = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    addToast({
      type: 'success',
      title: 'Copied to Clipboard',
      message: `${text} copied successfully.`,
    });
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const handleOpenPayModal = () => {
    setPayAmountType('full');
    setCustomPayAmount(String(currentFee.amountDue || 0));
    setIsPayModalOpen(true);
  };

  const handleProcessPayment = (e) => {
    e.preventDefault();
    const amountToPay =
      payAmountType === 'full' ? currentFee.amountDue : parseInt(customPayAmount, 10);

    if (!amountToPay || amountToPay <= 0) {
      addToast({
        type: 'error',
        title: 'Invalid Amount',
        message: 'Please enter a valid amount to pay.',
      });
      return;
    }

    if (amountToPay > currentFee.amountDue) {
      addToast({
        type: 'error',
        title: 'Amount Exceeds Due',
        message: `Amount cannot exceed current outstanding balance of ₹${currentFee.amountDue.toLocaleString()}.`,
      });
      return;
    }

    setIsProcessingPayment(true);

    setTimeout(() => {
      setIsProcessingPayment(false);
      setIsPayModalOpen(false);

      const newReceiptNo = `REC-2026-0${selectedSem}-00${Math.floor(100 + Math.random() * 900)}`;
      const newTxnId = `TXN_${paymentMethod.toUpperCase()}_${Date.now()}`;
      const nowStr = new Date().toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });

      const modeLabel =
        paymentMethod === 'upi'
          ? 'UPI Instant (GPay/PhonePe)'
          : paymentMethod === 'netbanking'
          ? 'Net Banking (SBI Portal)'
          : 'Debit/Credit Card (Visa/Mastercard)';

      const newReceipt = {
        receiptNo: newReceiptNo,
        transactionId: newTxnId,
        date: nowStr,
        amount: amountToPay,
        mode: modeLabel,
        status: 'Success',
        description: `Academic Fee Clearance - ${currentFee.semester}`,
      };

      const updatedSchedule = {
        ...feeSchedule,
        [selectedSem]: {
          ...currentFee,
          amountPaid: (currentFee.amountPaid || 0) + amountToPay,
          amountDue: Math.max(0, (currentFee.amountDue || 0) - amountToPay),
          status: (currentFee.amountDue || 0) - amountToPay <= 0 ? 'Paid' : 'Partial',
          paymentHistory: [newReceipt, ...(currentFee.paymentHistory || [])],
        },
      };

      if (onUpdateFeeSchedule) {
        onUpdateFeeSchedule(updatedSchedule);
      }

      addToast({
        type: 'success',
        title: 'Fee Payment Successful!',
        message: `Payment of ₹${amountToPay.toLocaleString()} confirmed. Receipt ${newReceiptNo} generated.`,
      });

      setSelectedReceipt(newReceipt);
    }, 1200);
  };

  const handleDownloadStatement = () => {
    addToast({
      type: 'info',
      title: 'Downloading Statement',
      message: `Full academic fee ledger for ${user?.name || 'Student'} is being compiled...`,
    });
    setTimeout(() => {
      window.print();
    }, 500);
  };

  return (
    <div className="space-y-6">
      {/* 1. TOP STATS OVERVIEW CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Paid */}
        <div className="p-4 rounded-xl border border-[#E5E5E5] bg-white shadow-xs">
          <div className="flex items-center justify-between text-[#737373] text-[11px] font-bold uppercase tracking-wider">
            <span>Total Fees Paid</span>
            <span className="p-1 rounded bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="h-4 w-4" />
            </span>
          </div>
          <p className="text-2xl font-black text-[#171717] mt-1.5">
            ₹{aggregateStats.totalPaid.toLocaleString()}
          </p>
          <span className="text-[11px] text-emerald-600 font-semibold mt-0.5 block flex items-center gap-1">
            Verified across all terms
          </span>
        </div>

        {/* Current Outstanding Due */}
        <div className="p-4 rounded-xl border border-[#E5E5E5] bg-white shadow-xs">
          <div className="flex items-center justify-between text-[#737373] text-[11px] font-bold uppercase tracking-wider">
            <span>Active Semester Due</span>
            <span
              className={`p-1 rounded ${
                currentFee.amountDue > 0
                  ? 'bg-amber-50 text-amber-600'
                  : 'bg-emerald-50 text-emerald-600'
              }`}
            >
              <CreditCard className="h-4 w-4" />
            </span>
          </div>
          <p
            className={`text-2xl font-black mt-1.5 ${
              currentFee.amountDue > 0 ? 'text-[#DC2626]' : 'text-emerald-700'
            }`}
          >
            {currentFee.amountDue > 0
              ? `₹${currentFee.amountDue.toLocaleString()}`
              : '₹0 (Cleared)'}
          </p>
          <span className="text-[11px] text-[#737373] mt-0.5 block">
            {currentFee.amountDue > 0
              ? `Due before: ${currentFee.dueDate}`
              : 'No pending dues for this term'}
          </span>
        </div>

        {/* Scholarship / Concession */}
        <div className="p-4 rounded-xl border border-[#E5E5E5] bg-white shadow-xs">
          <div className="flex items-center justify-between text-[#737373] text-[11px] font-bold uppercase tracking-wider">
            <span>Scholarship / Grant</span>
            <span className="p-1 rounded bg-purple-50 text-purple-600">
              <Sparkles className="h-4 w-4" />
            </span>
          </div>
          <p className="text-2xl font-black text-purple-700 mt-1.5">
            {currentFee.scholarship?.applied
              ? `₹${currentFee.scholarship.amount.toLocaleString()}`
              : '₹0'}
          </p>
          <span className="text-[11px] text-[#737373] truncate mt-0.5 block" title={currentFee.scholarship?.scheme}>
            {currentFee.scholarship?.applied
              ? currentFee.scholarship.scheme
              : 'No fee concession applied'}
          </span>
        </div>

        {/* Official Receipts */}
        <div className="p-4 rounded-xl border border-[#E5E5E5] bg-white shadow-xs">
          <div className="flex items-center justify-between text-[#737373] text-[11px] font-bold uppercase tracking-wider">
            <span>Fee Receipts</span>
            <span className="p-1 rounded bg-blue-50 text-blue-600">
              <Receipt className="h-4 w-4" />
            </span>
          </div>
          <p className="text-2xl font-black text-[#171717] mt-1.5">
            {aggregateStats.receiptsCount} Invoices
          </p>
          <span className="text-[11px] text-[#737373] mt-0.5 block">
            Digitally sealed & signed
          </span>
        </div>
      </div>

      {/* 2. SEMESTER FEE DETAILS & PAYMENT ACTION HERO */}
      <div className="bg-white rounded-xl border border-[#E5E5E5] p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-[#E5E5E5]">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-[#171717]">
                {currentFee.semester} Fee Schedule
              </h2>
              <Badge
                variant={
                  currentFee.status === 'Paid'
                    ? 'success'
                    : currentFee.status === 'Pending'
                    ? 'warning'
                    : 'secondary'
                }
                size="sm"
              >
                {currentFee.status === 'Paid'
                  ? 'Fully Paid'
                  : currentFee.status === 'Pending'
                  ? 'Balance Due'
                  : currentFee.status === 'Partial'
                  ? 'Partially Paid'
                  : 'Upcoming Term'}
              </Badge>
            </div>
            <p className="text-xs text-[#737373] mt-1">
              Academic Term: <strong>{currentFee.term}</strong> • Academic Year:{' '}
              <strong>{currentFee.academicYear}</strong>
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            {currentFee.amountDue > 0 && (
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={handleOpenPayModal}
                className="gap-2 shadow-xs cursor-pointer font-bold"
              >
                <CreditCard className="h-4 w-4" />
                <span>Pay Dues (₹{currentFee.amountDue.toLocaleString()})</span>
              </Button>
            )}

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleDownloadStatement}
              className="gap-1.5 cursor-pointer"
            >
              <Download className="h-4 w-4 text-[#737373]" />
              <span>Download Statement</span>
            </Button>

            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setIsBankDetailsOpen(!isBankDetailsOpen)}
              className="gap-1.5 cursor-pointer"
            >
              <Building2 className="h-4 w-4 text-[#737373]" />
              <span>Bank Wire Info</span>
              {isBankDetailsOpen ? (
                <ChevronUp className="h-3.5 w-3.5 text-[#737373]" />
              ) : (
                <ChevronDown className="h-3.5 w-3.5 text-[#737373]" />
              )}
            </Button>
          </div>
        </div>

        {/* Collapsible College Bank Details */}
        {isBankDetailsOpen && (
          <div className="my-4 p-4 rounded-xl bg-neutral-50 border border-neutral-200 animate-in fade-in duration-200">
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-neutral-200">
              <span className="text-xs font-bold text-[#171717] flex items-center gap-1.5 uppercase tracking-wider">
                <Building2 className="h-4 w-4 text-[#DC2626]" /> Official Institute Bank Account for NEFT / RTGS
              </span>
              <span className="text-[11px] text-[#737373]">
                Ground Floor Admin Block, Accounts Counter
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
              <div className="p-2.5 rounded-lg bg-white border border-neutral-200 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-[#737373] block uppercase font-bold">
                    Beneficiary Name
                  </span>
                  <span className="font-semibold text-[#171717]">
                    {COLLEGE_BANK_DETAILS.accountName}
                  </span>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-white border border-neutral-200 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-[#737373] block uppercase font-bold">
                    Bank & Branch
                  </span>
                  <span className="font-semibold text-[#171717]">
                    {COLLEGE_BANK_DETAILS.bankName} - {COLLEGE_BANK_DETAILS.branch}
                  </span>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-white border border-neutral-200 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-[#737373] block uppercase font-bold">
                    Account Number
                  </span>
                  <span className="font-mono font-bold text-[#171717]">
                    {COLLEGE_BANK_DETAILS.accountNumber}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    copyToClipboard(COLLEGE_BANK_DETAILS.accountNumber, 'acc')
                  }
                  className="p-1.5 rounded hover:bg-neutral-100 text-[#737373] hover:text-[#DC2626] cursor-pointer"
                  title="Copy Account Number"
                >
                  {copiedKey === 'acc' ? (
                    <Check className="h-4 w-4 text-emerald-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </button>
              </div>

              <div className="p-2.5 rounded-lg bg-white border border-neutral-200 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-[#737373] block uppercase font-bold">
                    IFSC Code
                  </span>
                  <span className="font-mono font-bold text-[#171717]">
                    {COLLEGE_BANK_DETAILS.ifscCode}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    copyToClipboard(COLLEGE_BANK_DETAILS.ifscCode, 'ifsc')
                  }
                  className="p-1.5 rounded hover:bg-neutral-100 text-[#737373] hover:text-[#DC2626] cursor-pointer"
                  title="Copy IFSC Code"
                >
                  {copiedKey === 'ifsc' ? (
                    <Check className="h-4 w-4 text-emerald-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </button>
              </div>

              <div className="p-2.5 rounded-lg bg-white border border-neutral-200 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-[#737373] block uppercase font-bold">
                    Official Fee UPI ID
                  </span>
                  <span className="font-mono font-bold text-[#DC2626]">
                    {COLLEGE_BANK_DETAILS.upiId}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    copyToClipboard(COLLEGE_BANK_DETAILS.upiId, 'upi')
                  }
                  className="p-1.5 rounded hover:bg-neutral-100 text-[#737373] hover:text-[#DC2626] cursor-pointer"
                  title="Copy UPI ID"
                >
                  {copiedKey === 'upi' ? (
                    <Check className="h-4 w-4 text-emerald-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </button>
              </div>

              <div className="p-2.5 rounded-lg bg-white border border-neutral-200 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-[#737373] block uppercase font-bold">
                    Accounts Office Desk
                  </span>
                  <span className="text-[#171717]">{COLLEGE_BANK_DETAILS.paymentHelpline}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 3. ITEM-BY-ITEM FEE HEAD BREAKDOWN TABLE */}
        <div className="mt-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#737373] flex items-center gap-1.5">
              <Receipt className="h-4 w-4" /> Itemized Academic Fee Breakdown
            </h3>
            <span className="text-xs text-[#737373]">
              Semester Total: <strong>₹{currentFee.totalPayable.toLocaleString()}</strong>
            </span>
          </div>

          <div className="overflow-x-auto rounded-lg border border-[#E5E5E5]">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAFAFA] border-b border-[#E5E5E5] text-[11px] font-bold text-[#737373] uppercase tracking-wider">
                <tr>
                  <th className="py-2.5 px-3">#</th>
                  <th className="py-2.5 px-4">Fee Head / Description</th>
                  <th className="py-2.5 px-4">Category</th>
                  <th className="py-2.5 px-4 text-right">Amount (INR)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E5E5]">
                {currentFee.breakdown?.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-neutral-50/70 transition-colors">
                    <td className="py-3 px-3 text-[#737373] font-mono">{idx + 1}</td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-[#171717] block">{item.head}</span>
                      {item.description && (
                        <span className="text-[11px] text-[#737373] block mt-0.5">
                          {item.description}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant="secondary" size="sm" className="text-[10px]">
                        Mandatory Head
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-[#171717]">
                      ₹{item.amount.toLocaleString()}
                    </td>
                  </tr>
                ))}

                {/* Scholarship Deduction Row if applied */}
                {currentFee.scholarship?.applied && (
                  <tr className="bg-purple-50/50">
                    <td className="py-3 px-3 text-purple-700 font-mono">★</td>
                    <td className="py-3 px-4">
                      <span className="font-bold text-purple-900 block flex items-center gap-1.5">
                        <Sparkles className="h-3.5 w-3.5 text-purple-600" />
                        {currentFee.scholarship.scheme}
                      </span>
                      <span className="text-[11px] text-purple-700 block">
                        Scholarship Code: {currentFee.scholarship.code} • Institutional Merit Grant
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant="primary" size="sm" className="bg-purple-100 text-purple-800 border-purple-200 text-[10px]">
                        Fee Concession
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-purple-700">
                      - ₹{currentFee.scholarship.amount.toLocaleString()}
                    </td>
                  </tr>
                )}
              </tbody>
              <tfoot className="bg-[#FAFAFA] border-t-2 border-[#E5E5E5] font-bold text-xs">
                <tr>
                  <td colSpan={3} className="py-3 px-4 text-[#171717]">
                    Total Net Fee Payable
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-sm text-[#171717]">
                    ₹{currentFee.totalPayable.toLocaleString()}
                  </td>
                </tr>
                <tr className="border-t border-[#E5E5E5] text-emerald-700">
                  <td colSpan={3} className="py-2.5 px-4">
                    Amount Paid to Date
                  </td>
                  <td className="py-2.5 px-4 text-right font-mono text-sm">
                    ₹{currentFee.amountPaid.toLocaleString()}
                  </td>
                </tr>
                <tr className="border-t border-[#E5E5E5] bg-[#FEF2F2]">
                  <td colSpan={3} className="py-3 px-4 text-[#DC2626]">
                    Remaining Outstanding Balance
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-base font-extrabold text-[#DC2626]">
                    ₹{currentFee.amountDue.toLocaleString()}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>

      {/* 4. OFFICIAL PAYMENT RECEIPTS & TRANSACTION HISTORY */}
      <div className="bg-white rounded-xl border border-[#E5E5E5] p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#E5E5E5]">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-[#171717] flex items-center gap-2">
              <Receipt className="h-4 w-4 text-[#DC2626]" /> Official Fee Receipts & Payment Ledger
            </h3>
            <p className="text-xs text-[#737373] mt-0.5">
              Verified university transaction receipts eligible for income tax deduction (80E) and student records
            </p>
          </div>
        </div>

        {currentFee.paymentHistory?.length === 0 ? (
          <div className="text-center py-8 rounded-lg border border-dashed border-[#E5E5E5] p-6 text-xs text-[#737373]">
            <Receipt className="h-8 w-8 text-[#A3A3A3] mx-auto mb-2 opacity-50" />
            <p className="font-semibold text-[#171717]">No payment transactions recorded for {currentFee.semester}.</p>
            <p className="mt-1">Payments made through online gateway or bank transfer will appear here with instant download slips.</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-[#E5E5E5]">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAFAFA] border-b border-[#E5E5E5] text-[11px] font-bold text-[#737373] uppercase tracking-wider">
                <tr>
                  <th className="py-2.5 px-4">Receipt Number</th>
                  <th className="py-2.5 px-4">Transaction Ref</th>
                  <th className="py-2.5 px-4">Date & Time</th>
                  <th className="py-2.5 px-4">Payment Method</th>
                  <th className="py-2.5 px-4 text-right">Amount</th>
                  <th className="py-2.5 px-4 text-center">Status</th>
                  <th className="py-2.5 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E5E5]">
                {currentFee.paymentHistory?.map((receipt) => (
                  <tr key={receipt.receiptNo} className="hover:bg-neutral-50/70 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-[#171717]">
                      {receipt.receiptNo}
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-[#737373]">
                      {receipt.transactionId}
                    </td>
                    <td className="py-3 px-4 text-[#525252]">{receipt.date}</td>
                    <td className="py-3 px-4 font-medium text-[#171717]">{receipt.mode}</td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-emerald-700">
                      ₹{receipt.amount.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="h-3 w-3" /> {receipt.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedReceipt(receipt)}
                        className="gap-1 text-[11px] py-1 px-2.5 cursor-pointer"
                      >
                        <FileText className="h-3.5 w-3.5 text-[#DC2626]" />
                        <span>View Receipt</span>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 5. ALL SEMESTERS PAYMENT OVERVIEW TABLE */}
      <div className="bg-white rounded-xl border border-[#E5E5E5] p-5 shadow-xs space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#737373] flex items-center gap-1.5">
          <Clock className="h-4 w-4" /> Degree Fee Ledger by Semester (Sem 1 to 8)
        </h3>

        <div className="overflow-x-auto rounded-lg border border-[#E5E5E5]">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAFAFA] border-b border-[#E5E5E5] text-[11px] font-bold text-[#737373] uppercase tracking-wider">
              <tr>
                <th className="py-2.5 px-4">Semester</th>
                <th className="py-2.5 px-4">Academic Term</th>
                <th className="py-2.5 px-4 text-right">Total Payable</th>
                <th className="py-2.5 px-4 text-right">Paid Amount</th>
                <th className="py-2.5 px-4 text-right">Balance Due</th>
                <th className="py-2.5 px-4 text-center">Status</th>
                <th className="py-2.5 px-4 text-center">Select</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E5E5]">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((sNum) => {
                const sData = feeSchedule[sNum];
                if (!sData) return null;
                const isSelected = selectedSem === sNum;

                return (
                  <tr
                    key={sNum}
                    className={`transition-colors ${
                      isSelected ? 'bg-red-50/50 font-medium' : 'hover:bg-neutral-50/70'
                    }`}
                  >
                    <td className="py-2.5 px-4 font-bold text-[#171717]">
                      {sData.semester}
                    </td>
                    <td className="py-2.5 px-4 text-[#737373]">{sData.term}</td>
                    <td className="py-2.5 px-4 text-right font-mono">
                      ₹{sData.totalPayable.toLocaleString()}
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono text-emerald-700 font-semibold">
                      ₹{sData.amountPaid.toLocaleString()}
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono">
                      {sData.amountDue > 0 ? (
                        <span className="font-bold text-[#DC2626]">
                          ₹{sData.amountDue.toLocaleString()}
                        </span>
                      ) : (
                        <span className="text-[#A3A3A3]">₹0</span>
                      )}
                    </td>
                    <td className="py-2.5 px-4 text-center">
                      <Badge
                        variant={
                          sData.status === 'Paid'
                            ? 'success'
                            : sData.status === 'Pending'
                            ? 'warning'
                            : 'secondary'
                        }
                        size="sm"
                        className="text-[10px]"
                      >
                        {sData.status}
                      </Badge>
                    </td>
                    <td className="py-2.5 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => onSelectSem(sNum)}
                        className={`text-[11px] font-bold px-2 py-0.5 rounded cursor-pointer transition-colors ${
                          isSelected
                            ? 'bg-[#DC2626] text-white'
                            : 'text-[#737373] hover:text-[#DC2626] hover:bg-neutral-100'
                        }`}
                      >
                        {isSelected ? 'Viewing' : 'View'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: PAY SEMESTER DUES ONLINE GATEWAY                                  */}
      {/* ========================================================================= */}
      <Modal
        isOpen={isPayModalOpen}
        onClose={() => !isProcessingPayment && setIsPayModalOpen(false)}
        title={`Pay ${currentFee.semester} Academic Dues`}
        description="Encrypted 256-bit institutional payment gateway"
        footer={
          <div className="flex items-center justify-end gap-2 w-full">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isProcessingPayment}
              onClick={() => setIsPayModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              disabled={isProcessingPayment}
              onClick={handleProcessPayment}
              className="gap-1.5 font-bold"
            >
              {isProcessingPayment ? (
                <>Processing Payment...</>
              ) : (
                <>
                  <ShieldCheck className="h-4 w-4" />
                  <span>
                    Pay ₹
                    {(payAmountType === 'full'
                      ? currentFee.amountDue
                      : parseInt(customPayAmount || 0, 10)
                    ).toLocaleString()}{' '}
                    Now
                  </span>
                </>
              )}
            </Button>
          </div>
        }
      >
        <form onSubmit={handleProcessPayment} className="space-y-4 text-xs">
          {/* Summary Box */}
          <div className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-200 flex items-center justify-between">
            <div>
              <span className="text-[11px] text-[#737373] block uppercase font-bold">
                Total Remaining Balance
              </span>
              <span className="text-xl font-black text-[#DC2626]">
                ₹{currentFee.amountDue.toLocaleString()}
              </span>
            </div>
            <div className="text-right">
              <span className="text-[11px] text-[#737373] block">Due Date:</span>
              <span className="font-bold text-[#171717]">{currentFee.dueDate}</span>
            </div>
          </div>

          {/* Amount Selection */}
          <div className="space-y-2">
            <label className="block font-bold text-[#171717]">Select Payment Amount:</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setPayAmountType('full');
                  setCustomPayAmount(String(currentFee.amountDue));
                }}
                className={`p-3 rounded-lg border text-left cursor-pointer transition-all ${
                  payAmountType === 'full'
                    ? 'border-[#DC2626] bg-[#FEF2F2] text-[#DC2626] font-bold'
                    : 'border-[#E5E5E5] bg-white text-[#525252] hover:border-neutral-300'
                }`}
              >
                <span className="block text-xs">Pay Full Dues</span>
                <span className="block font-mono text-sm mt-0.5">
                  ₹{currentFee.amountDue.toLocaleString()}
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setPayAmountType('custom');
                  setCustomPayAmount(String(Math.min(25000, currentFee.amountDue)));
                }}
                className={`p-3 rounded-lg border text-left cursor-pointer transition-all ${
                  payAmountType === 'custom'
                    ? 'border-[#DC2626] bg-[#FEF2F2] text-[#DC2626] font-bold'
                    : 'border-[#E5E5E5] bg-white text-[#525252] hover:border-neutral-300'
                }`}
              >
                <span className="block text-xs">Pay Custom Installment</span>
                <span className="block font-mono text-sm mt-0.5">Partial Amount</span>
              </button>
            </div>

            {payAmountType === 'custom' && (
              <div className="mt-2">
                <label className="block text-[11px] font-semibold text-[#737373] mb-1">
                  Enter Custom Installment Amount (₹):
                </label>
                <input
                  type="number"
                  min="1000"
                  max={currentFee.amountDue}
                  value={customPayAmount}
                  onChange={(e) => setCustomPayAmount(e.target.value)}
                  className="w-full p-2.5 border border-[#E5E5E5] rounded-lg bg-white text-xs font-mono font-bold text-[#171717] focus:outline-none focus:ring-1 focus:ring-[#DC2626]"
                />
              </div>
            )}
          </div>

          {/* Payment Method Tabs */}
          <div className="space-y-2">
            <label className="block font-bold text-[#171717]">Select Payment Method:</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setPaymentMethod('upi')}
                className={`p-2.5 rounded-lg border flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                  paymentMethod === 'upi'
                    ? 'border-[#DC2626] bg-[#FEF2F2] text-[#DC2626] font-bold'
                    : 'border-[#E5E5E5] bg-white text-[#525252] hover:border-neutral-300'
                }`}
              >
                <QrCode className="h-5 w-5 mb-1 text-[#DC2626]" />
                <span className="text-[11px]">Instant UPI</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('netbanking')}
                className={`p-2.5 rounded-lg border flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                  paymentMethod === 'netbanking'
                    ? 'border-[#DC2626] bg-[#FEF2F2] text-[#DC2626] font-bold'
                    : 'border-[#E5E5E5] bg-white text-[#525252] hover:border-neutral-300'
                }`}
              >
                <Building2 className="h-5 w-5 mb-1 text-[#DC2626]" />
                <span className="text-[11px]">Net Banking</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('card')}
                className={`p-2.5 rounded-lg border flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                  paymentMethod === 'card'
                    ? 'border-[#DC2626] bg-[#FEF2F2] text-[#DC2626] font-bold'
                    : 'border-[#E5E5E5] bg-white text-[#525252] hover:border-neutral-300'
                }`}
              >
                <CreditCard className="h-5 w-5 mb-1 text-[#DC2626]" />
                <span className="text-[11px]">Debit/Credit</span>
              </button>
            </div>
          </div>

          {/* Method Specific Details */}
          {paymentMethod === 'upi' && (
            <div className="p-3 rounded-lg bg-neutral-50 border border-neutral-200 space-y-2">
              <div className="flex items-center gap-2">
                <Smartphone className="h-4 w-4 text-[#DC2626]" />
                <span className="font-bold text-[#171717]">Scan & Pay with any UPI App</span>
              </div>
              <p className="text-[11px] text-[#737373]">
                Supports Google Pay, PhonePe, Paytm, BHIM, Cred, and all bank UPI applications.
              </p>
              <div className="flex items-center justify-between p-2 rounded bg-white border border-neutral-200">
                <span className="font-mono text-xs text-[#171717]">{COLLEGE_BANK_DETAILS.upiId}</span>
                <Badge variant="secondary" size="sm" className="text-[10px]">
                  Zero Surcharge
                </Badge>
              </div>
            </div>
          )}

          {paymentMethod === 'netbanking' && (
            <div className="p-3 rounded-lg bg-neutral-50 border border-neutral-200 space-y-2">
              <span className="font-bold text-[#171717] block">Select Your Bank:</span>
              <select className="w-full p-2 border border-[#E5E5E5] rounded bg-white text-xs">
                <option>State Bank of India (SBI) - Recommended</option>
                <option>HDFC Bank</option>
                <option>ICICI Bank</option>
                <option>Axis Bank</option>
                <option>Punjab National Bank (PNB)</option>
              </select>
            </div>
          )}

          {paymentMethod === 'card' && (
            <div className="p-3 rounded-lg bg-neutral-50 border border-neutral-200 space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Card Number (•••• •••• •••• ••••)"
                  defaultValue="4532 •••• •••• 9812"
                  className="col-span-2 p-2 border border-[#E5E5E5] rounded bg-white text-xs"
                />
                <input
                  type="text"
                  placeholder="MM/YY"
                  defaultValue="08/29"
                  className="p-2 border border-[#E5E5E5] rounded bg-white text-xs"
                />
                <input
                  type="password"
                  placeholder="CVV"
                  defaultValue="•••"
                  className="p-2 border border-[#E5E5E5] rounded bg-white text-xs"
                />
              </div>
            </div>
          )}

          <div className="p-2 rounded bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-800 flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 shrink-0" />
            <span>CampusHub Institute uses PCI-DSS Level 1 compliant secure payment gateway.</span>
          </div>
        </form>
      </Modal>

      {/* ========================================================================= */}
      {/* MODAL 2: OFFICIAL PRINTABLE RECEIPT POPUP                                 */}
      {/* ========================================================================= */}
      <Modal
        isOpen={Boolean(selectedReceipt)}
        onClose={() => setSelectedReceipt(null)}
        title="Official Academic Fee Receipt"
        description="Authentic digital transaction slip verified by the Accounts & Finance Division"
        footer={
          <div className="flex items-center justify-between w-full">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setSelectedReceipt(null)}
            >
              Close
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={() => window.print()}
              className="gap-1.5 font-bold cursor-pointer"
            >
              <Printer className="h-4 w-4" />
              <span>Print / Save PDF</span>
            </Button>
          </div>
        }
      >
        {selectedReceipt && (
          <div className="space-y-4 text-xs p-4 rounded-xl border border-neutral-200 bg-white">
            {/* Institute Header */}
            <div className="text-center pb-3 border-b-2 border-neutral-200 space-y-0.5">
              <h4 className="font-extrabold text-sm text-[#171717] uppercase tracking-wide">
                CampusHub Institute of Technology
              </h4>
              <p className="text-[11px] text-[#737373]">
                University Campus, Institutional Area, Knowledge Park III
              </p>
              <p className="text-[10px] text-[#DC2626] font-bold">
                FINANCE & ACCOUNTS DEPARTMENT • STUDENT FEE RECEIPT
              </p>
            </div>

            {/* Receipt Meta */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-[10px] text-[#737373] block uppercase font-bold">
                  Receipt Number:
                </span>
                <span className="font-mono font-bold text-[#171717]">
                  {selectedReceipt.receiptNo}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-[#737373] block uppercase font-bold">
                  Payment Date:
                </span>
                <span className="font-semibold text-[#171717]">
                  {selectedReceipt.date}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-[#737373] block uppercase font-bold">
                  Transaction Ref:
                </span>
                <span className="font-mono text-[11px] text-[#737373]">
                  {selectedReceipt.transactionId}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-[#737373] block uppercase font-bold">
                  Payment Channel:
                </span>
                <span className="font-semibold text-[#171717]">
                  {selectedReceipt.mode}
                </span>
              </div>
            </div>

            {/* Student Info Box */}
            <div className="p-2.5 rounded-lg bg-neutral-50 border border-neutral-200 grid grid-cols-2 gap-2">
              <div>
                <span className="text-[10px] text-[#737373] block uppercase">Student Name:</span>
                <strong className="text-[#171717]">{user?.name || user?.fullName || 'Sayan Mukherjee'}</strong>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-[#737373] block uppercase">Roll / Reg Number:</span>
                <strong className="font-mono text-[#171717]">{user?.rollNo || '21BCSE084'}</strong>
              </div>
              <div>
                <span className="text-[10px] text-[#737373] block uppercase">Program:</span>
                <span className="text-[#525252]">B.Tech (Computer Science & Eng.)</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-[#737373] block uppercase">Term:</span>
                <span className="font-bold text-[#DC2626]">{currentFee.semester}</span>
              </div>
            </div>

            {/* Amount Cleared */}
            <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-emerald-900 block">
                  Amount Received in Full:
                </span>
                <span className="text-[10px] text-emerald-700">
                  {selectedReceipt.description || 'Academic Registration & Tuition Fee'}
                </span>
              </div>
              <span className="text-xl font-black text-emerald-800 font-mono">
                ₹{selectedReceipt.amount.toLocaleString()}
              </span>
            </div>

            {/* Seal & Verification */}
            <div className="flex items-center justify-between pt-3 border-t border-neutral-200 text-[10px] text-[#737373]">
              <div className="flex items-center gap-1.5 text-emerald-700 font-semibold">
                <CheckCircle2 className="h-4 w-4" />
                <span>Digitally Authenticated (CampusHub Treasury)</span>
              </div>
              <div className="text-right">
                <span className="block font-bold text-[#171717]">Authorized Signatory</span>
                <span>Finance & Accounts Office</span>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
