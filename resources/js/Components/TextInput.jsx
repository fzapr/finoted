import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';

export default forwardRef(function TextInput(
    { type = 'text', className = '', isFocused = false, ...props },
    ref,
) {
    const localRef = useRef(null);

    useImperativeHandle(ref, () => ({
        focus: () => localRef.current?.focus(),
    }));

    useEffect(() => {
        if (isFocused) {
            localRef.current?.focus();
        }
    }, [isFocused]);

    return (
        <input
            {...props}
            type={type}
            className={
                'rounded-md border-gray-300 dark:border-[#3e4144] dark:bg-[#16181c] dark:text-[#e7e9ea] shadow-sm focus:border-[#1d9bf0] focus:ring-[#1d9bf0] dark:placeholder:text-[#71767b] ' +
                className
            }
            ref={localRef}
        />
    );
});
