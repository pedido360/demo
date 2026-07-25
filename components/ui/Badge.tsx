interface Props {
    children: React.ReactNode;
}

export default function Badge({
    children,
}: Props) {
    return (
        <span className="
      inline-flex
      items-center
      rounded-full
      border
      border-orange-200
      bg-orange-50
      px-4
      py-2
      text-sm
      font-medium
      text-orange-600
    ">
            {children}
        </span>
    );
}