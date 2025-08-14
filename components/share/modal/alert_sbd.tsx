import Swal from 'sweetalert2';

const AlertSBD = Swal.mixin({
  buttonsStyling: false,
  customClass: {
    title: 'text-xl',
    actions: 'flex gap-4 w-full px-6',
    confirmButton: 'btn btn-primary text-white normal-case flex-1',
    cancelButton: 'p-3 border border-[--border-color] rounded-md text-gray-400 flex-1',
    popup: 'rounded-box',
    closeButton: 'button-close',
    htmlContainer: 'text-alert'
  }
});

export default AlertSBD;
