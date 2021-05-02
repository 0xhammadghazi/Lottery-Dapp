const Warning = ({ Network }) => {
  return (
    <div id="warning">
      {Network ? (
        <div>
          You are on the {Network} network. To use the Lottery Dapp, please
          switch to Kovan network.
        </div>
      ) : null}
    </div>
  );
};

export default Warning;
