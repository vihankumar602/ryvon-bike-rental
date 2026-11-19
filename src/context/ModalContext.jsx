import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const ModalContext = createContext();

export function ModalProvider({ children }) {
  const [modal, setModal] = useState(null);

  const openModal = useCallback((type, props = {}) => {
    setModal({ type, props });
  }, []);

  const closeModal = useCallback(() => {
    setModal(null);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && modal) {
        closeModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [modal, closeModal]);

  const modalType = typeof modal === 'object' && modal !== null ? modal.type : modal;
  const modalProps = typeof modal === 'object' && modal !== null ? (modal.props || {}) : {};

  return (
    <ModalContext.Provider value={{ modal: modalType, modalProps, modalRaw: modal, openModal, closeModal }}>
      {children}
    </ModalContext.Provider>
  );
}

export function useModal() {
  const context = useContext(ModalContext);
  if (!context) {
    return {
      modal: null,
      modalProps: {},
      modalRaw: null,
      openModal: () => {},
      closeModal: () => {}
    };
  }
  return context;
}
