import React, { useState } from 'react';
import './styles/table.scss'
import ReactPaginate from 'react-paginate';
import { ChevronRightIcon, ChevronLeftIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';

interface Column {
  field: string;
  headerName: string;
  width?: number;
  renderCell?: (row: Row) => React.ReactNode;
}

interface Row {
  [key: string]: any;
}

interface TableProps {
  columns: Column[];
  rows: Row[];
  itemsPerPage: number;
  className?: string;
  actionRowClick?: any;
}

const Table: React.FC<TableProps> = ({ columns, rows, itemsPerPage, className, actionRowClick }) => {
  const [itemOffset, setItemOffset] = useState(0);
  const endOffset = itemOffset + itemsPerPage;
  const currentItems = rows.slice(itemOffset, endOffset);
  const pageCount = Math.ceil(rows.length / itemsPerPage);
  const handlePageClick = (event:any) => {
    const newOffset = (event.selected * itemsPerPage) % rows.length;
    setItemOffset(newOffset);
  };
   const router = useRouter();
  return (
    <div className={`main-table ${className}`}>
      <table>
        <thead>
          <tr>
            {columns.map((column) => (
              <th
                key={column.field}
                style={{ width: column.width }}
              >
                {column.headerName}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {currentItems.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {columns.map((column) => (
                <td
                  key={column.field}
                  style={{ width: column.width }}
                  className='cursor-pointer'
                  onClick={() => { actionRowClick(row) }}
                >
                  {column.renderCell ? column.renderCell(row) : row[column.field]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <ReactPaginate
        className="pagination-container"
        pageClassName="pagination-list"
        breakLabel="..."
        nextLabel={<ChevronRightIcon className="h-5 w-5" />}
        onPageChange={handlePageClick}
        pageRangeDisplayed={5}
        pageCount={pageCount}
        previousLabel={<ChevronLeftIcon className="h-5 w-5" />}
        renderOnZeroPageCount={null}
      />
    </div>
  );
};

export default Table;
