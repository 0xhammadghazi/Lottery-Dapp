const Table = ({ pot, participants }) => {
  return (
    <table>
      <tbody>
        <tr>
          <td>
            <b>Players Participating</b>
          </td>
          <td>{participants}</td>
        </tr>
        <tr>
          <td>
            <b>Lottery Pot</b>
          </td>
          <td>{`${pot} Ether`}</td>
        </tr>
      </tbody>
    </table>
  );
};

export default Table;
