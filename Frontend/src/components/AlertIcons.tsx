import React from 'react';

import { CheckCircle2, XCircleIcon, InfoIcon, AlertTriangle } from 'lucide-react';

export interface AlertIconsProps { type: 'success' | 'destructive' | 'info' | 'warning'; className?: string; }

export const AlertIcons: React.FC<AlertIconsProps> = ({ type, className = 'h-4 w-4' }) => {
switch (type) {
case 'success': return <CheckCircle2 className={className} />;
case 'destructive': return <XCircleIcon className={className} />;
case 'info': return <InfoIcon className={className} />;
case 'warning': return <AlertTriangle className={className} />;
default: return null;
}
};

export const AlertIconsMap = { success: CheckCircle2, destructive: XCircleIcon, info: InfoIcon, warning: AlertTriangle };

export default AlertIcons;