export default {
  'purchase': {
    records: {
      '1': {id: '1', name: 'credits', amount: 10, ledger: 1, player: 1}
    }
  },

  'ledger': {
    records: {
      '1': {id: '1', title: 'payable', players: [1], purchases: [1]}
    }
  },

  'player': {
    records: {
      '1': {id: '1', name: 'one', balance: -10, ledger: 1, purchases: [1]}
    }
  }
};