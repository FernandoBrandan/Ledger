import { IsOptional, IsString, Length, Matches, MaxLength } from 'class-validator'

export class TransferRequestDto {
  @IsString()
  sourceAccountId: string

  @IsString()
  destinationAccountId: string

  /** Monto como string decimal, ej: "100.50". Nunca number (perdería precisión). */
  @IsString()
  @Matches(/^\d+(\.\d+)?$/, { message: 'amount debe ser un decimal positivo' })
  amount: string

  @IsString()
  @Length(3, 3)
  currencyCode: string

  @IsString()
  @MaxLength(100)
  reference: string

  @IsOptional()
  @IsString()
  idempotencyKey?: string
}
