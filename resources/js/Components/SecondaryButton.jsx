export default function SecondaryButton({
    type = 'button',
    className = '',
    disabled,
    children,
    ...props
}) {
    return (
        <button
            {...props}
            type={type}
            className={
                `inline-flex items-center rounded-md border border-gray-300 dark:border-[#2f3336] bg-white dark:bg-[#15202b] px-4 py-2 text-xs font-semibold uppercase tracking-widest text-gray-700 dark:text-[#e7e9ea] shadow-sm transition duration-150 ease-in-out hover:bg-gray-50 dark:hover:bg-[#16181c] focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-25 ${
                    disabled && 'opacity-25'
                } ` + className
            }
            disabled={disabled}
        >
            {children}
        </button>
    );
}
