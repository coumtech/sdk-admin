import React, { forwardRef } from 'react';
import { Select } from "@headlessui/react";

interface SelectInputProps<T> extends React.SelectHTMLAttributes<HTMLSelectElement> {
    options: T[];
    labelKey?: keyof T;
    valueKey?: keyof T;
}

const SelectInput = forwardRef<HTMLSelectElement, SelectInputProps<any>>(
    ({ options, labelKey = 'label', valueKey = 'value', className, defaultValue, ...rest }, ref) => {
        return (
            <div className='relative'>
                <Select className={`form-control ${className}`} defaultValue={defaultValue} {...rest} >
                    <option value="" style={{display: 'none'}}>Select value</option>
                    {options.map((option, index) => (
                        <option key={index} value={option[valueKey as keyof typeof option]} style={{ backgroundColor: '#0C0C0C' }}>
                            {option[labelKey as keyof typeof option]}
                        </option>
                    ))}
                </Select>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" data-slot="icon" className="group pointer-events-none absolute top-5 right-5 size-5 fill-white/60"><path fillRule="evenodd" d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd"></path></svg>
            </div>
        );
    }
);

SelectInput.displayName = 'SelectInput';

export default SelectInput;
