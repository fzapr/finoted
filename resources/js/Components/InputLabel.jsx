export default function InputLabel({
    value,
    className = '',
    children,
    ...props
}) {
    return (
        <label
            {...props}
            className={
                `block text-sm font-medium text-gray-700 dark:text-[#e7e9ea] ` +
                className
            }
        >
            {value ? value : children}
        </label>
    );
}
