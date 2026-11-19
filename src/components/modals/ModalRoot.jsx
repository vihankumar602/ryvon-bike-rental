import React from 'react';
import { useModal } from '../../context/ModalContext';

import BuildMyRideModal from './BuildMyRideModal';
import CommandPaletteModal from './CommandPaletteModal';
import Bike360Modal from './Bike360Modal';
import AIAssistantModal from './AIAssistantModal';
import AICompareModal from './AICompareModal';
import JourneyDetailModal from './JourneyDetailModal';
import SOSEmergencyModal from './SOSEmergencyModal';
import ExpeditionPreviewModal from './ExpeditionPreviewModal';
import WeekendEscapeModal from './WeekendEscapeModal';
import QuickBookModal from './QuickBookModal';
import WhyThisBikeModal from './WhyThisBikeModal';
import ARPreviewModal from './ARPreviewModal';
import VerifiedInfoModal from './VerifiedInfoModal';
import AvailabilityAlertModal from './AvailabilityAlertModal';
import RiderPersonaModal from './RiderPersonaModal';
import AuthModalForBooking from './AuthModalForBooking';
import ModifyBookingModal from './ModifyBookingModal';
import DeleteBookingConfirmModal from './DeleteBookingConfirmModal';
import AuthRequiredModal from './AuthRequiredModal';
import LogoutConfirmModal from './LogoutConfirmModal';

export default function ModalRoot() {
  const { modal, modalProps, closeModal } = useModal();

  if (!modal) return null;

  const renderModalContent = () => {
    // If modal is a JSX element or component
    if (React.isValidElement(modal)) {
      return modal;
    }

    switch (modal) {
      case 'buildMyRide':
      case 'build-my-ride':
        return <BuildMyRideModal {...modalProps} />;
      case 'commandPalette':
      case 'command-palette':
      case 'cmdk':
      case 'search':
        return <CommandPaletteModal {...modalProps} />;
      case 'bike360':
      case 'bike-360':
      case '360':
        return <Bike360Modal {...modalProps} />;
      case 'aiAssistant':
      case 'ai-assistant':
      case 'voice':
        return <AIAssistantModal {...modalProps} />;
      case 'aiCompare':
      case 'ai-compare':
      case 'compare':
        return <AICompareModal {...modalProps} />;
      case 'journeyDetail':
      case 'journey-detail':
        return <JourneyDetailModal {...modalProps} />;
      case 'modifyBooking':
      case 'modify-booking':
      case 'editBooking':
      case 'edit-booking':
        return <ModifyBookingModal {...modalProps} />;
      case 'deleteBooking':
      case 'delete-booking':
      case 'cancelBooking':
      case 'cancel-booking':
        return <DeleteBookingConfirmModal {...modalProps} />;
      case 'sosEmergency':
      case 'sos-emergency':
      case 'sos':
        return <SOSEmergencyModal {...modalProps} />;
      case 'expeditionPreview':
      case 'expedition-preview':
        return <ExpeditionPreviewModal {...modalProps} />;
      case 'weekendEscape':
      case 'weekend-escape':
        return <WeekendEscapeModal {...modalProps} />;
      case 'quickBook':
      case 'quick-book':
        return <QuickBookModal {...modalProps} />;
      case 'whyThisBike':
      case 'why-this-bike':
        return <WhyThisBikeModal {...modalProps} />;
      case 'arPreview':
      case 'ar-preview':
        return <ARPreviewModal {...modalProps} />;
      case 'verifiedInfo':
      case 'verified-info':
        return <VerifiedInfoModal {...modalProps} />;
      case 'availAlert':
      case 'avail-alert':
        return <AvailabilityAlertModal {...modalProps} />;
      case 'riderPersona':
      case 'rider-persona':
      case 'persona':
      case 'persona-picker':
        return <RiderPersonaModal {...modalProps} />;
      case 'authForBooking':
      case 'auth-for-booking':
        return <AuthModalForBooking {...modalProps} />;
      case 'authRequired':
      case 'auth-required':
      case 'authPrompt':
      case 'auth-prompt':
      case 'auth':
        return <AuthRequiredModal {...modalProps} />;
      case 'logoutConfirm':
      case 'logout-confirm':
      case 'confirmLogout':
        return <LogoutConfirmModal {...modalProps} />;
      default:
        return null;
    }
  };

  const content = renderModalContent();
  if (!content) return null;

  return (
    <div
      className="modal-backdrop active"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          closeModal();
        }
      }}
    >
      {content}
    </div>
  );
}
