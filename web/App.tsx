import { FormEvent, useEffect, useMemo, useState } from "react";
import { calculateChart } from "../src/index.js";
import type { ChartInput, ChartResult, Gender } from "../src/index.js";
import {
  buildNotionTemplate,
  defaultChartFormState,
  formatSpecialStarBasis,
  formatSpecialStarPillars,
  formStateToChartInput,
  summarizeChart,
  type ChartFormState
} from "./chartForm.js";
import { GoogleMapsGeocodingProvider, type GeocodingResult } from "./geocoding.js";
import { loadGoogleMapsScript } from "./googleMapsLoader.js";
import {
  addChartHistoryItem,
  clearChartHistory,
  deleteChartHistoryItem,
  loadChartHistory,
  type SavedChartHistoryItem
} from "./history.js";

declare global {
  interface Window {
    __SHICHUSUIMEI_CONFIG__?: {
      googleMapsApiKey?: string;
    };
  }
}

type ChartPillarKey = "hour" | "day" | "month" | "year";

function formatPillar(
  label: string,
  key: ChartPillarKey,
  pillar: ChartResult["pillars"]["year"] | ChartResult["pillars"]["hour"],
  hiddenStem?: string,
  hiddenTenGod?: string
) {
  return {
    label,
    key,
    number: pillar ? `#${pillar.number}` : "-",
    stem: pillar?.stem ?? "-",
    branch: pillar?.branch ?? "-",
    hiddenStem: hiddenStem ?? "-",
    tenGod: pillar?.tenGod ?? "-",
    hiddenTenGod: hiddenTenGod ?? "-",
    twelveStage: pillar?.twelveStage ?? "-"
  };
}

function makeHistoryItem(input: ChartInput, chart: ChartResult): SavedChartHistoryItem {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    createdAt: new Date().toISOString(),
    displayName: input.birthPlace.label,
    input,
    summary: summarizeChart(chart)
  };
}

export function App() {
  const [form, setForm] = useState<ChartFormState>(() => defaultChartFormState());
  const [chart, setChart] = useState<ChartResult | undefined>();
  const [history, setHistory] = useState<SavedChartHistoryItem[]>([]);
  const [addressQuery, setAddressQuery] = useState("岡山県岡山市南区千鳥町");
  const [addressResults, setAddressResults] = useState<GeocodingResult[]>([]);
  const [addressStatus, setAddressStatus] = useState("");
  const [exportStatus, setExportStatus] = useState("");
  const googleMapsApiKey =
    window.__SHICHUSUIMEI_CONFIG__?.googleMapsApiKey || (import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined);
  const geocodingProvider = useMemo(() => new GoogleMapsGeocodingProvider(), []);

  useEffect(() => {
    setHistory(loadChartHistory(window.localStorage));
  }, []);

  useEffect(() => {
    if (!googleMapsApiKey) return;
    loadGoogleMapsScript(googleMapsApiKey).catch(() => {
      setAddressStatus("住所検索を読み込めませんでした。経度を手入力してください。");
    });
  }, [googleMapsApiKey]);

  function updateForm(partial: Partial<ChartFormState>) {
    setForm((current) => ({ ...current, ...partial }));
  }

  function calculate(event?: FormEvent) {
    event?.preventDefault();
    const input = formStateToChartInput(form);
    const nextChart = calculateChart(input);
    setChart(nextChart);
    setHistory(addChartHistoryItem(window.localStorage, makeHistoryItem(input, nextChart)));
  }

  async function searchAddress() {
    if (!googleMapsApiKey) {
      setAddressStatus("住所検索には VITE_GOOGLE_MAPS_API_KEY が必要です。経度は手入力できます。");
      return;
    }

    setAddressStatus("検索中");
    try {
      const results = await geocodingProvider.searchAddress(addressQuery);
      setAddressResults(results);
      setAddressStatus(results.length > 0 ? `${results.length}件見つかりました` : "候補がありません。経度を手入力してください。");
    } catch {
      setAddressResults([]);
      setAddressStatus("住所検索に失敗しました。経度を手入力してください。");
    }
  }

  function applyAddress(result: GeocodingResult) {
    updateForm({
      birthPlaceLabel: result.label,
      latitude: result.latitude,
      longitude: Number(result.longitude.toFixed(4))
    });
    setAddressResults([]);
    setAddressStatus("出生地を反映しました");
  }

  function loadHistory(item: SavedChartHistoryItem) {
    setForm({
      birthDate: item.input.birthDate,
      birthTime: item.input.birthTime ?? "",
      gender: item.input.gender,
      birthPlaceLabel: item.input.birthPlace.label,
      longitude: item.input.birthPlace.longitude,
      useLocationCorrection: item.input.useLocationCorrection
    });
    setChart(calculateChart(item.input));
  }

  function savePdf() {
    window.print();
  }

  async function copyNotionTemplate() {
    if (!chart) return;
    const template = buildNotionTemplate(chart);

    try {
      await window.navigator.clipboard.writeText(template);
      setExportStatus("Notion用テンプレートをコピーしました");
    } catch {
      setExportStatus("コピーできませんでした。ブラウザの権限を確認してください。");
    }
  }

  const hiddenStemMap: Partial<Record<ChartPillarKey, { stem: string; tenGod: string }>> = chart
    ? chart.powerScore.hiddenStemContributions.reduce<Partial<Record<ChartPillarKey, { stem: string; tenGod: string }>>>(
        (map, contribution) => ({
          ...map,
          [contribution.pillar]: {
            stem: contribution.stem,
            tenGod: contribution.tenGod
          }
        }),
        {}
      )
    : {};
  const pillars = chart
    ? [
        formatPillar("時柱", "hour", chart.pillars.hour, hiddenStemMap.hour?.stem, hiddenStemMap.hour?.tenGod),
        formatPillar("日柱", "day", chart.pillars.day, hiddenStemMap.day?.stem, hiddenStemMap.day?.tenGod),
        formatPillar("月柱", "month", chart.pillars.month, hiddenStemMap.month?.stem, hiddenStemMap.month?.tenGod),
        formatPillar("年柱", "year", chart.pillars.year, hiddenStemMap.year?.stem, hiddenStemMap.year?.tenGod)
      ]
    : [];

  return (
    <main className="app-shell">
      <section className="workspace">
        <form className="panel input-panel" onSubmit={calculate}>
          <div className="panel-header">
            <h1>四柱推命 計算</h1>
            <p>入力内容はこの端末の履歴以外には保存しません。</p>
          </div>

          <div className="field-grid">
            <label>
              生年月日
              <input type="date" value={form.birthDate} onChange={(event) => updateForm({ birthDate: event.target.value })} required />
            </label>
            <label>
              出生時刻
              <input type="time" value={form.birthTime} onChange={(event) => updateForm({ birthTime: event.target.value })} />
            </label>
            <label>
              性別
              <select value={form.gender} onChange={(event) => updateForm({ gender: event.target.value as Gender })}>
                <option value="male">男性</option>
                <option value="female">女性</option>
              </select>
            </label>
            <label className="toggle-field">
              <input
                type="checkbox"
                checked={form.useLocationCorrection}
                onChange={(event) => updateForm({ useLocationCorrection: event.target.checked })}
              />
              経度補正を使う
            </label>
          </div>

          <div className="address-box">
            <label>
              住所検索
              <div className="inline-control">
                <input value={addressQuery} onChange={(event) => setAddressQuery(event.target.value)} placeholder="出生地を入力" />
                <button type="button" onClick={searchAddress}>
                  検索
                </button>
              </div>
            </label>
            <p className="hint">{addressStatus || "住所検索時はGoogleへ住所文字列が送信されます。"}</p>
            {addressResults.length > 0 && (
              <div className="result-list">
                {addressResults.slice(0, 5).map((result) => (
                  <button type="button" key={`${result.label}-${result.longitude}`} onClick={() => applyAddress(result)}>
                    {result.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="field-grid">
            <label>
              出生地表示名
              <input value={form.birthPlaceLabel} onChange={(event) => updateForm({ birthPlaceLabel: event.target.value })} />
            </label>
            <label>
              経度
              <input
                type="number"
                step="0.0001"
                min="-180"
                max="180"
                value={form.longitude}
                onChange={(event) => updateForm({ longitude: Number(event.target.value) })}
                required
              />
            </label>
          </div>

          <button className="primary-action" type="submit">
            計算する
          </button>
        </form>

        <section className="panel result-panel">
          <div className="panel-header">
            <h2>計算結果</h2>
            {chart && <p>{chart.input.birthDate} {chart.input.birthTime ?? "時刻不明"}</p>}
          </div>

          {chart ? (
            <>
              <div className="export-actions">
                <button type="button" onClick={savePdf}>PDF保存</button>
                <button type="button" onClick={copyNotionTemplate}>Notionテンプレートをコピー</button>
                {exportStatus && <span>{exportStatus}</span>}
              </div>

              <section className="paper-chart" aria-label="命式表">
                <div className="paper-chart-header">
                  <h3>命式表</h3>
                  <span>{chart.input.birthPlace.label}</span>
                </div>
                <div className="paper-chart-table" role="table">
                  <div className="paper-chart-row paper-chart-column-labels" role="row">
                    <div className="paper-chart-row-label" role="columnheader"></div>
                    {pillars.map((pillar) => (
                      <div className="paper-chart-cell paper-chart-column-title" role="columnheader" key={pillar.key}>
                        {pillar.label}
                      </div>
                    ))}
                  </div>
                  <div className="paper-chart-row paper-chart-small-row" role="row">
                    <div className="paper-chart-row-label" role="rowheader">干支番号</div>
                    {pillars.map((pillar) => (
                      <div className="paper-chart-cell" role="cell" key={`${pillar.key}-number`}>
                        {pillar.number}
                      </div>
                    ))}
                  </div>
                  <div className="paper-chart-row paper-chart-main-row" role="row">
                    <div className="paper-chart-row-label" role="rowheader">天干</div>
                    {pillars.map((pillar) => (
                      <div className="paper-chart-cell paper-chart-kan" role="cell" key={`${pillar.key}-stem`}>
                        {pillar.stem}
                      </div>
                    ))}
                  </div>
                  <div className="paper-chart-row paper-chart-main-row" role="row">
                    <div className="paper-chart-row-label" role="rowheader">地支</div>
                    {pillars.map((pillar) => (
                      <div className="paper-chart-cell paper-chart-kan" role="cell" key={`${pillar.key}-branch`}>
                        {pillar.branch}
                      </div>
                    ))}
                  </div>
                  <div className="paper-chart-row" role="row">
                    <div className="paper-chart-row-label" role="rowheader">蔵干</div>
                    {pillars.map((pillar) => (
                      <div className="paper-chart-cell" role="cell" key={`${pillar.key}-hidden-stem`}>
                        {pillar.hiddenStem}
                      </div>
                    ))}
                  </div>
                  <div className="paper-chart-row" role="row">
                    <div className="paper-chart-row-label" role="rowheader">通変星</div>
                    {pillars.map((pillar) => (
                      <div className="paper-chart-cell" role="cell" key={`${pillar.key}-ten-god`}>
                        {pillar.tenGod}
                      </div>
                    ))}
                  </div>
                  <div className="paper-chart-row" role="row">
                    <div className="paper-chart-row-label" role="rowheader">蔵干通変</div>
                    {pillars.map((pillar) => (
                      <div className="paper-chart-cell" role="cell" key={`${pillar.key}-hidden-ten-god`}>
                        {pillar.hiddenTenGod}
                      </div>
                    ))}
                  </div>
                  <div className="paper-chart-row" role="row">
                    <div className="paper-chart-row-label" role="rowheader">十二運</div>
                    {pillars.map((pillar) => (
                      <div className="paper-chart-cell" role="cell" key={`${pillar.key}-twelve-stage`}>
                        {pillar.twelveStage}
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              <div className="metrics">
                <div><span>空亡</span><strong>{chart.voidBranches}</strong></div>
                <div><span>大運</span><strong>{chart.luckStart.direction === "forward" ? "順行" : "逆行"} {chart.luckStart.startAge}歳</strong></div>
                <div><span>パワー</span><strong>{chart.powerScore.total} / {chart.powerScore.classification}</strong></div>
                <div><span>守護神</span><strong>{chart.guardianDeity.guardianStems.join("・") || "未入力"}</strong></div>
              </div>

              <div className="correction-box">
                <h3>時柱補正</h3>
                <p>補正前 {chart.hourComparison?.uncorrected?.ganzhi ?? "-"} / 補正後 {chart.hourComparison?.corrected?.ganzhi ?? "-"} / 採用 {chart.pillars.hour?.ganzhi ?? "-"}</p>
              </div>

              <section className="special-stars-section">
                <div className="section-title">
                  <h3>特殊星</h3>
                  <span>{chart.specialStars.status === "known" ? `${chart.specialStars.matches.length}件` : "要データ"}</span>
                </div>
                {chart.specialStars.matches.length > 0 ? (
                  <table className="special-stars-table">
                    <thead>
                      <tr><th>特殊星</th><th>判定元</th><th>該当柱</th></tr>
                    </thead>
                    <tbody>
                      {chart.specialStars.matches.map((match) => (
                        <tr key={`${match.basis}-${match.star}`}>
                          <td>{match.star}</td>
                          <td>{formatSpecialStarBasis(match.basis)}</td>
                          <td>{formatSpecialStarPillars(match.matchedPillars)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p className="empty-state">特殊星の該当はありません。</p>
                )}
              </section>

              <table className="luck-table">
                <thead>
                  <tr><th>年齢</th><th>干支</th><th>通変星</th><th>十二運</th></tr>
                </thead>
                <tbody>
                  {chart.luckPillars.map((luck) => (
                    <tr key={`${luck.startAge}-${luck.pillar.ganzhi}`}>
                      <td>{luck.startAge}-{luck.endAge}</td>
                      <td>{luck.pillar.ganzhi}</td>
                      <td>{luck.pillar.tenGod}</td>
                      <td>{luck.pillar.twelveStage}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <section className="annual-fortunes-section">
                <div className="section-title">
                  <h3>流年運</h3>
                  <span>{chart.annualFortunes[0]?.year}-{chart.annualFortunes.at(-1)?.year}</span>
                </div>
                <table className="annual-fortunes-table">
                  <thead>
                    <tr><th>年</th><th>干支</th><th>通変星</th><th>十二運</th></tr>
                  </thead>
                  <tbody>
                    {chart.annualFortunes.map((fortune) => (
                      <tr key={fortune.year}>
                        <td>{fortune.year}</td>
                        <td>{fortune.pillar.ganzhi}</td>
                        <td>{fortune.pillar.tenGod}</td>
                        <td>{fortune.pillar.twelveStage}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </section>
            </>
          ) : (
            <p className="empty-state">入力して計算すると、命式と大運がここに表示されます。</p>
          )}
        </section>
      </section>

      <aside className="panel history-panel">
        <div className="panel-header compact">
          <h2>履歴</h2>
          <button
            type="button"
            onClick={() => {
              clearChartHistory(window.localStorage);
              setHistory([]);
            }}
          >
            全削除
          </button>
        </div>
        <div className="history-list">
          {history.map((item) => (
            <div className="history-item" key={item.id}>
              <button type="button" onClick={() => loadHistory(item)}>
                <strong>{item.summary.pillars.day}日</strong>
                <span>{item.input.birthDate} {item.input.birthTime ?? ""}</span>
                <small>{item.displayName}</small>
              </button>
              <button
                type="button"
                aria-label="履歴を削除"
                onClick={() => setHistory(deleteChartHistoryItem(window.localStorage, item.id))}
              >
                ×
              </button>
            </div>
          ))}
          {history.length === 0 && <p className="empty-state">履歴はまだありません。</p>}
        </div>
      </aside>
    </main>
  );
}
