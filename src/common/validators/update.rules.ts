import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';

export function AtLeastOneField(
  fields: (keyof any)[],
  options?: ValidationOptions,
) {
  return function (target: any, propertyName: string) {
    registerDecorator({
      name: 'AtLeastOneField',
      target: target.constructor,
      propertyName,
      options,
      validator: {
        validate(_: any, args: ValidationArguments) {
          const obj = args.object as Record<string, unknown>;
          const ok = fields.some((k) => {
            const v = obj[k as string];
            return v !== undefined && v !== null && String(v).trim() !== '';
          });

          return ok;
        },

        defaultMessage() {
          return 'At least one field must be filled';
        },
      },
    });
  };
}

export function PasswordPairRequired(options?: ValidationOptions) {
  return function (target: any, propertyName: string) {
    registerDecorator({
      name: 'PasswordPairRequired',
      target: target.constructor,
      propertyName,
      options,
      validator: {
        validate(_: any, args: ValidationArguments) {
          const obj: any = args.object;
          const hasNew = !!obj.password;
          const hasOld = !!obj.passwordOld;
          const ok = (hasNew && hasOld) || (!hasNew && !hasOld);

          return ok;
        },
        defaultMessage() {
          return 'password and passwordOld mush be provided together';
        },
      },
    });
  };
}

export function NotEqual(
  aKey: string,
  bKey: string,
  options: ValidationOptions,
) {
  return function (target: any, propertyName: string) {
    registerDecorator({
      name: 'NotEqual',
      target: target.constructor,
      propertyName,
      options,
      validator: {
        validate(_: any, args: ValidationArguments) {
          const obj = args.object as any;
          const a = obj[aKey];
          const b = obj[bKey];
          const skip = a === undefined || b === undefined;
          const ok = skip ? true : a !== b;

          return ok;
        },
        defaultMessage() {
          return `${aKey} must be different from ${bKey}`;
        },
      },
    });
  };
}
