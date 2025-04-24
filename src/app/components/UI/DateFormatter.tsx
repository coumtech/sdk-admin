import React from 'react';
import { format } from 'date-fns';

interface DateFormatterProps {
  date: string | Date;
  formatStr?: string;
}

const DateFormatter: React.FC<DateFormatterProps> = ({ date , formatStr = 'dd MMMM yyyy' }) => {
  const formattedDate = format(new Date(date), formatStr);
  return <span>{formattedDate}</span>;
};

export default DateFormatter;