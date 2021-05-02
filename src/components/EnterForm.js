const Enter = ({ handleSubmit }) => {
  return (
    <form onSubmit={handleSubmit} id="form">
      <h3 id="send">Send ether to participate</h3>
      <p id="minimum">Minimum 0.01 ether</p>
      <br />
      <input type="text" id="inputField" placeholder="Enter amount in ether" />
      <br />
      <button>Enter</button>
    </form>
  );
};

export default Enter;
