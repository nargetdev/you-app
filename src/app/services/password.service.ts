import { Injectable } from "@angular/core";
import { BoxService } from "./box.service";
import { SecureStorageService } from "./secure-storage.service";

export interface IAccount {
  id: string;
  title: string;
  icon: string;
  username: string;
  location: string;
  lastUsed: Date;
  group: string;
  tag: string[];
  password?: string;
}

@Injectable({
  providedIn: "root"
})
export class PasswordService {
  accountList: IAccount[] = undefined;

  constructor(
    private readonly boxService: BoxService,
    private readonly secureStorageService: SecureStorageService
  ) {
    const cachedAccountsString = window.localStorage.getItem("accounts");
    if (cachedAccountsString) {
      console.log("READING FROM CACHE");
      const cachedAccounts = JSON.parse(cachedAccountsString);
      this.accountList = cachedAccounts;
    }
    this.boxService.ready.promise.then(async () => {
      const secureStorage = await this.secureStorageService.get(
        "secret",
        false
      );
      const secret = await secureStorage.getItem("secret");

      this.boxService
        .readPasswords("main", secret)
        .then((accounts: IAccount[]) => {
          window.localStorage.setItem("accounts", JSON.stringify(accounts));
          this.accountList = accounts;
        });
    });
  }

  async getPasswordForLocation(location: string): Promise<IAccount> {
    await this.boxService.ready.promise;
    const result = this.accountList.find(
      account => account.location === location
    );

    if (result) {
      return result;
    } else {
      throw new Error("No account found!");
    }
  }

  async getPasswordById(id: string) {
    return this.accountList.find(account => account.id === id);
  }
}
