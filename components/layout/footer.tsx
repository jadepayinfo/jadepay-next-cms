import Link from 'next/link';

export const Footer = () => {
  return (
    <footer className="footer footer-center p-4 bg-base-100 text-base-content">
      <div>
        <p className='flex items-center'>
          <span className='text-[20px] mx-1'>©</span> Developed
          <Link className="mx-1 text-primary font-bold" href={'https://www.jadepay.co/'}>
            Jadepay
          </Link>
          by 2025
        </p>
      </div>
    </footer>
  );
};
