import React from "react";

import Modal from "react-modal";

const  AdminDashboard = () => {
  const [modalIsOpen, setModalIsOpen] = React.useState(false);

  function openModal() {
    setModalIsOpen(true);
  }

  function closeModal() {
    setModalIsOpen(false);
  }

  return (
    <div>
      <button onClick={openModal}>Open Modal</button>

      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        contentLabel="Example Modal"
        className={"z-1000"}
      >
        <h2>Modal Title</h2>

        <button onClick={closeModal}>Close</button>

        <div>
          djlsakjdlksaj 
          f ds
           fd 
           fds f
           sd fsd 
           fd
        </div>
      </Modal>
    </div>
  );
}

export default AdminDashboard;
