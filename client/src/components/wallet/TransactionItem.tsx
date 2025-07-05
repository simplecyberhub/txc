import { 
  ArrowUp, 
  ArrowDown, 
  Plus, 
  ArrowRight
} from "lucide-react";

interface TransactionItemProps {
  id: number;
  type: string;
  amount: number;
  currency: string;
  status: string;
  assetSymbol?: string;
  assetType?: string;
  createdAt: string;
}

export default function TransactionItem({
  type,
  amount,
  currency,
  status,
  assetSymbol,
  createdAt,
}: TransactionItemProps) {
  // Gets the icon for transaction type
  const getTransactionIcon = () => {
    switch(type.toLowerCase()) {
      case 'deposit':
        return <Plus className="h-4 w-4 text-blue-600" />;
      case 'withdrawal':
        return <ArrowRight className="h-4 w-4 text-yellow-600" />;
      case 'buy':
        return <ArrowUp className="h-4 w-4 text-green-600" />;
      case 'sell':
        return <ArrowDown className="h-4 w-4 text-red-600" />;
      default:
        return <Plus className="h-4 w-4 text-gray-600" />;
    }
  };
  
  // Gets the color for transaction type
  const getTransactionColor = () => {
    switch(type.toLowerCase()) {
      case 'deposit':
        return 'bg-blue-100';
      case 'withdrawal':
        return 'bg-yellow-100';
      case 'buy':
        return 'bg-green-100';
      case 'sell':
        return 'bg-red-100';
      default:
        return 'bg-gray-100';
    }
  };
  
  // Gets the status badge color
  const getStatusColor = () => {
    switch(status.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  // Format date
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  return (
    <tr>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className={`flex-shrink-0 h-8 w-8 rounded-full ${getTransactionColor()} flex items-center justify-center`}>
            {getTransactionIcon()}
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-900">{type}</p>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <p className="text-sm text-gray-900">{assetSymbol || currency}</p>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <p className="text-sm text-gray-900">${amount.toFixed(2)}</p>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {formatDate(createdAt)}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor()}`}>
          {status}
        </span>
      </td>
    </tr>
  );
}
