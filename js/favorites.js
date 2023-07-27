import { GithubUser } from "./GithubUser.js";

export class Favorites {
  constructor(root) {
    this.root = document.querySelector(root);
    this.load();
  }

  load() {
    this.entries = JSON.parse(localStorage.getItem("@github-favorites:")) || [];
  }

  save() {
    localStorage.setItem("@github-favorites:", JSON.stringify(this.entries));
  }

  async add(username) {
    try {
      const userExists = this.entries.find((entry) => entry.login.toLowerCase() === username);
      if (userExists) {
        throw new Error("User already registered.");
      }

      const user = await GithubUser.search(username);

      if (user.login === undefined) {
        throw new Error("User not found!");
      }

      this.entries = [user, ...this.entries];
      this.update();
      this.save();
    } catch (error) {
      alert(error.message);
    }
  }

  delete(user) {
    const filteredEntries = this.entries.filter(
      (entry) => entry.login !== user.login
    );

    this.entries = filteredEntries;
    this.update();
    this.save();
  }
}

export class FavoritesView extends Favorites {
  constructor(root) {
    super(root);
    this.tbody = this.root.querySelector("table tbody");
    this.update();
    this.onAdd();
  }

  onAdd() {
    const addButton = this.root.querySelector(".search button");
    addButton.onclick = () => {
      let { value } = this.root.querySelector(".search input");
      value = value.toLowerCase();
      this.add(value);
      this.noFavorites();
    };
  }

  update() {
    this.removeAllTr();

    this.entries.forEach((user) => {
      const row = this.createRow();

      row.querySelector(
        ".user img"
      ).src = `https://github.com/${user.login}.png`;
      row.querySelector(".user img").alt = `Image of ${user.name}`;
      row.querySelector(".user p").textContent = user.name;
      row.querySelector(".user a").href = `https://github.com/${user.login}`;
      row.querySelector(".user span").textContent = user.login;
      row.querySelector(".repositories").textContent = user.public_repos;
      row.querySelector(".followers").textContent = user.followers;
      row.querySelector(".remove").onclick = () => {
        const isOk = confirm("Are you sure you want to delete it?");
        if (isOk) {
          this.delete(user);
        }
      };
      this.tbody.append(row);
    });

    this.noFavorites();
  }

  noFavorites() {
    const emptyPage = this.root.querySelector("#empty-favorites");
    
    if (this.entries.length === 0) {
      emptyPage.classList.remove("hide");
    } else {
      emptyPage.classList.add("hide");
    }
  }

  createRow() {
    const tr = document.createElement("tr");

    const content = `
    <tr>
    <td class="user">
    <img src="http://github.com/moaramiranda.png" alt="user image">
    <a href="http://github.com/moaramiranda" target="_blank">
    <p>Moara Miranda</p>
          <span>/moaramiranda</span>
        </a>
      </td>

      <td class="repositories">20</td>
      <td class="followers">6</td>
      <td class="action">
      <button class="remove">Remove</button>
      </td>
    </tr>`;

    tr.innerHTML = content;
    return tr;
  }

  removeAllTr() {
    this.tbody.querySelectorAll("tr").forEach((tr) => {
      tr.remove();
    });
  }
}
