const fetch = require('node-fetch');

class BoappaApi {
  #token = undefined;
  #email;
  #password;
  #api;

  constructor(email, password, api) {
    this.#email = email;
    this.#password = password;
    this.#api = api;
  }

  async getFacility(facility) {
    const response = await this.#call(`/facilities/facility/${facility}`);
    return (await response.json()).data;
  }

  async patchFacility(facility, data) {
    await this.#call(`/facilities/facility/${facility}`, data, 'PATCH');
  }

  async login() {
    const response = await this.#call('/users/login', {
      email: this.#email,
      password: this.#password
    }, 'POST');

    const json = await response.json();
    this.#token = json.data.token;
  }

  async #call(url, body, method = 'GET') {
    const response = await fetch(`${this.#api}${url}`, {
      method: method,
      body: JSON.stringify(body),
      headers: {
        'User-Agent': undefined,
        'Content-Type': method !== 'GET' ? 'application/json' : undefined,
        'Authorization': this.#token ? `Bearer ${this.#token}` : undefined,
      }
    });

    if (response.status > 299) {
      console.error(response, await response.text());
      throw new Error('API call failed');
    }

    return response;
  }
}

module.exports = {
  BoappaApi
};
