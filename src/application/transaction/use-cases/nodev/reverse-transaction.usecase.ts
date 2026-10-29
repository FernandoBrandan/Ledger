// // application/accounting/transactions/reverse-transaction.usecase.ts
// @Injectable()
// export class ReverseTransactionUseCase {
//   constructor(@Inject(TRANSACTION_REPOSITORY) private readonly repo: TransactionRepository) {}

//   async execute(transactionId: string, reason: string): Promise<Transaction> {
//     const tx = await this.repo.findById(TransactionId.from(transactionId))
//     if (!tx) throw new NotFoundError('Transaction', transactionId)

//     const reversal = tx.reverse(reason)
//     await this.repo.save(tx) // marcada REVERSED
//     await this.repo.save(reversal) // nueva POSTED
//     return reversal
//   }
// }
