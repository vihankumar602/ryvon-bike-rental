import React from 'react';
import BuildMyRideView from '../build/BuildMyRideView';
import { useModal } from '../../context/ModalContext';

export default function BuildMyRideModal() {
  const { closeModal } = useModal();

  return (
    <div className="build-my-ride-modal-outer" onClick={e => e.stopPropagation()}>
      <BuildMyRideView isModal={true} onClose={closeModal} />
    </div>
  );
}
