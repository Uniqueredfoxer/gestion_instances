

export default function Alerte({ message }: { message: string }) {
  return (
    <div className='bg-red-200 text-red-700'>
      <p>{message}</p>
    </div>
  );
}