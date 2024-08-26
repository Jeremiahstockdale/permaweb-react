import { h, FunctionalComponent } from 'preact';
import './DeleteConfirmationModal.css';
import { JSX } from 'preact';

type DeleteConfirmationModalProps = {
	isOpen: boolean;
	onClose: () => void;
	onDelete: () => void;
};

const DeleteConfirmationModal = ({isOpen, onClose, onDelete}: DeleteConfirmationModalProps): JSX.Element => {
	if (!isOpen) return <></>;

	return (
		<div className="modal-overlay">
			<div className="modal-container">
				<h2>Confirm Deletion</h2>
				<p>Are you sure you want to delete this item?</p>
				<div className="modal-buttons">
					<button onClick={() => {
						onDelete()
						onClose()
						}} className="modal-button confirm">Yes, Delete</button>
					<button onClick={onClose} className="modal-button cancel">Cancel</button>
				</div>
			</div>
		</div>
	);
};

export default DeleteConfirmationModal;
