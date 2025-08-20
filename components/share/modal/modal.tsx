import Image from 'next/image';
import CloseIcon from '@/public/assets/close.png';

const Modal = ({
  modalId,
  title,
  children
}: {
  modalId?: string;
  title?: string;
  closeIcon?: boolean;
  children: React.ReactNode;
}) => {
  return (
    <>
      {/* Open the modal using ID.showModal() method */}
      <dialog id={modalId} className="modal">
        <form method="dialog" className="modal-box scroll-ui">
          <button className=" cursor-pointer absolute top-3 right-3">
            <Image src={CloseIcon} alt="icon" width={24} height={24} />
          </button>
          {title && (
            <div className=" text-center text-xl font-bold mb-5">{title}</div>
          )}
          {children}
        </form>
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
        <div id="alert-in-form"></div>
      </dialog>
    </>
  );
};

export default Modal;
