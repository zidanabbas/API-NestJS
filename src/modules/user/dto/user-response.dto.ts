export class UserResponseDto {
  /**
   * User ID
   * @example 1
   */
  id!: number;

  /**
   * Full name of the user
   * @example "Budi Santoso"
   */
  name!: string;

  /**
   * Email address
   * @example "budi@example.com"
   */
  email!: string;

  /**
   * Timestamp when the user was created
   */
  createdAt!: Date;

  /**
   * Timestamp when the user was last updated
   */
  updatedAt!: Date;
}
