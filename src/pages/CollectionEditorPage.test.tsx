import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import DbContext from "../context/DbContext";
import { CollectionContextProvider } from "../CollectionContext";
import CollectionEditorPage from "./CollectionEditorPage";

// Component test: real page + real CollectionContext (localStorage), stubbed route DB.
// react-i18next is not initialised here, so t(key) returns the Chinese key itself.
const n = (zh: string, en: string) => ({ zh, en });
const db = {
  routeList: {
    "1A-X": {
      route: "1A",
      orig: n("A", "A"),
      dest: n("B", "B"),
      co: ["gmb"],
      stops: { gmb: ["s1", "s2"] },
    },
  },
  stopList: { s1: { name: n("站一", "One") }, s2: { name: n("站二", "Two") } },
};

const renderPage = () =>
  render(
    <DbContext.Provider value={{ db } as never}>
      <CollectionContextProvider>
        <CollectionEditorPage />
      </CollectionContextProvider>
    </DbContext.Provider>
  );

const seed = (collections: unknown) =>
  localStorage.setItem("collections", JSON.stringify(collections));
const stored = () => JSON.parse(localStorage.getItem("collections") ?? "[]");

beforeEach(() => localStorage.clear());
afterEach(cleanup);

describe("CollectionEditorPage", () => {
  it("shows existing (legacy-format) collections", () => {
    seed([
      { name: "Home", list: ["1A-X/0"], schedules: [] },
      { name: "Work", list: [], schedules: [] },
    ]);
    renderPage();
    expect(screen.getByText("Home")).toBeTruthy();
    expect(screen.getByText("Work")).toBeTruthy();
  });

  it("does not crash on corrupt localStorage and falls back to defaults", () => {
    localStorage.setItem("collections", "{not json");
    renderPage();
    expect(screen.getByText("Home")).toBeTruthy(); // default collections
  });

  it("drops malformed collection entries instead of crashing", () => {
    seed([{ name: "Ok", list: ["1A-X/0"] }, { nope: true }, null]);
    renderPage();
    expect(screen.getByText("Ok")).toBeTruthy();
  });

  it("creates a collection with a unique default name and persists it", async () => {
    seed([{ name: "New Collection", list: [], schedules: [] }]);
    renderPage();
    await userEvent.click(screen.getAllByText("新增收藏")[0]);
    await userEvent.keyboard("{Enter}"); // accept the proposed name
    expect(stored().map((c: { name: string }) => c.name)).toEqual([
      "New Collection",
      "New Collection 2",
    ]);
  });

  it("rejects a rename to an existing name", async () => {
    seed([
      { name: "A", list: [], schedules: [] },
      { name: "B", list: [], schedules: [] },
    ]);
    renderPage();
    const bCard = screen
      .getByText("B")
      .closest(".MuiPaper-root") as HTMLElement;
    await userEvent.click(within(bCard).getByLabelText("更多操作"));
    await userEvent.click(screen.getByText("重新命名"));
    const input = await screen.findByLabelText("收藏名稱");
    await userEvent.clear(input);
    await userEvent.type(input, "A{Enter}");
    expect(screen.getByText("名稱已存在")).toBeTruthy();
    expect(stored().map((c: { name: string }) => c.name)).toEqual(["A", "B"]);
  });

  it("asks for confirmation before deleting, and Undo restores", async () => {
    seed([{ name: "A", list: ["1A-X/0"], schedules: [] }]);
    renderPage();
    await userEvent.click(screen.getByLabelText("更多操作"));
    await userEvent.click(screen.getByText("刪除"));
    expect(stored()).toHaveLength(1); // nothing removed before confirming
    const dialog = screen.getByRole("dialog");
    await userEvent.click(within(dialog).getByText("刪除"));
    expect(stored()).toHaveLength(0);
    await userEvent.click(screen.getByText("復原"));
    expect(stored()).toEqual([{ name: "A", list: ["1A-X/0"], schedules: [] }]);
  });

  it("removes an item with Undo and moves it down with the menu alternative to drag", async () => {
    seed([{ name: "A", list: ["1A-X/0", "1A-X/1"], schedules: [] }]);
    renderPage();
    await userEvent.click(screen.getAllByLabelText("展開")[0]); // collection A (Starred is open)
    // reorder via menu
    await screen.findAllByLabelText("移除"); // StrictModeDroppable renders after an animation frame
    const moreButtons = screen.getAllByLabelText("更多操作");
    await userEvent.click(moreButtons[1]); // first item's menu
    await userEvent.click(screen.getByText("下移"));
    expect(stored()[0].list).toEqual(["1A-X/1", "1A-X/0"]);
    // remove then undo
    await userEvent.click(screen.getAllByLabelText("移除")[0]);
    expect(stored()[0].list).toEqual(["1A-X/0"]);
    await userEvent.click(screen.getByText("復原"));
    expect(stored()[0].list).toEqual(["1A-X/1", "1A-X/0"]);
  });
});
