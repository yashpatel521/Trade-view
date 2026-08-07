'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { importPortfolioCsvAction, CsvTradeImportRecord } from '@/lib/actions/trading';
import {
  UploadCloud,
  FileSpreadsheet,
  Download,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  PlusCircle,
  Loader2,
  ArrowRight,
  ShieldCheck,
  Trash2,
  FileText,
} from 'lucide-react';
import { StockLogo } from '@/components/ui/StockLogo';

interface ParsedRow extends CsvTradeImportRecord {
  id: number;
  isValid: boolean;
  errorReason?: string;
  originalSymbol?: string;
}

export default function ImportCsvClient() {
  const [file, setFile] = useState<File | null>(null);
  const [parsedRows, setParsedRows] = useState<ParsedRow[]>([]);
  const [mode, setMode] = useState<'APPEND' | 'RESET'>('RESET');
  const [initialCad, setInitialCad] = useState<string>('10000');
  const [initialUsd, setInitialUsd] = useState<string>('0');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [importStatus, setImportStatus] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Helper to download Wealthsimple Sample CSV template
  const handleDownloadWealthsimpleTemplate = () => {
    const header = 'Account Name,Account Type,Account Classification,Account Number,Symbol,Exchange,MIC,Name,Security Type,Quantity,Position Direction,Market Price,Market Price Currency,Book Value (CAD),Book Value Currency (CAD),Book Value (Market),Book Value Currency (Market),Market Value,Market Value Currency,Market Unrealized Returns,Market Unrealized Returns Currency';
    const rows = [
      '"TFSA","TFSA","Trade","HQ5B17HK8CAD","AAPL","NASDAQ","XNAS","Apple Inc","EQUITY","12","LONG","313.65","USD","5306.41884","CAD","3732","USD","3765","USD","33","USD"',
      '"TFSA","TFSA","Trade","HQ5B17HK8CAD","AVGO","NASDAQ","XNAS","Broadcom Inc.","EQUITY","5","LONG","363.755","USD","2656.9708","CAD","1870","USD","1818.775","USD","-51.225","USD"',
      '"TFSA","TFSA","Trade","HQ5B17HK8CAD","CRWD","NASDAQ","XNAS","Crowdstrike Holdings Inc (Class A)","EQUITY","6.5108","LONG","197.765","USD","1811.4077651","CAD","1273.97","USD","1282.106736","USD","8.136736","USD"',
      '"TFSA","TFSA","Trade","HQ5B17HK8CAD","NVDA","NASDAQ","XNAS","NVIDIA Corp","EQUITY","10","LONG","192.86","USD","2783.34325","CAD","1957","USD","1928.4","USD","-28.6","USD"',
      '"TFSA","TFSA","Trade","HQ5B17HK8CAD","SHOP","TSX","XTSE","Shopify Inc.","EQUITY","25","LONG","95.40","CAD","2385.00","CAD","2385.00","CAD","2385.00","CAD","0","CAD"',
      '',
      '"As of 2026-07-07 11:21 GMT-04:00"',
    ];
    const csvContent = 'data:text/csv;charset=utf-8,' + [header, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'wealthsimple_holdings_sample.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Helper to download Standard Trade History Template
  const handleDownloadStandardTemplate = () => {
    const header = 'Date,Ticker,Action,Shares,Price,Currency';
    const sampleRows = [
      '2026-08-01,NVDA,BUY,10,128.50,USD',
      '2026-08-02,AAPL,BUY,15,222.00,USD',
      '2026-08-03,SHOP.TO,BUY,25,94.50,CAD',
      '2026-08-04,RY.TO,BUY,20,152.80,CAD',
      '2026-08-05,TSLA,SELL,5,210.00,USD',
    ];
    const csvContent = 'data:text/csv;charset=utf-8,' + [header, ...sampleRows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'standard_trade_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Advanced CSV split function respecting quoted commas
  const parseCsvLine = (textLine: string): string[] => {
    const result: string[] = [];
    let cur = '';
    let inQuotes = false;
    for (let i = 0; i < textLine.length; i++) {
      const c = textLine[i];
      if (c === '"') {
        inQuotes = !inQuotes;
      } else if (c === ',' && !inQuotes) {
        result.push(cur.trim().replace(/^["']|["']$/g, ''));
        cur = '';
      } else {
        cur += c;
      }
    }
    result.push(cur.trim().replace(/^["']|["']$/g, ''));
    return result;
  };

  // Universal Header & Format Parsing Engine
  const parseCsvText = (text: string): ParsedRow[] => {
    const rawLines = text.split(/\r\n|\n/).map((l) => l.trim()).filter(Boolean);
    if (rawLines.length === 0) return [];

    // Extract footer date if present (e.g. "As of 2026-07-07 11:21 GMT-04:00")
    let extractedAsOfDate = new Date().toISOString().split('T')[0];
    for (let i = rawLines.length - 1; i >= 0; i--) {
      const line = rawLines[i];
      const match = line.match(/As of\s+([0-9]{4}-[0-9]{2}-[0-9]{2})/i);
      if (match && match[1]) {
        extractedAsOfDate = match[1];
        break;
      }
    }

    // Filter out footer lines starting with "As of"
    const dataLines = rawLines.filter((l) => !l.toLowerCase().startsWith('"as of') && !l.toLowerCase().startsWith('as of'));
    if (dataLines.length === 0) return [];

    const headerParts = parseCsvLine(dataLines[0]).map((h) => h.toLowerCase().trim());

    // Check header column indices
    const symbolIdx = headerParts.findIndex((h) => h === 'symbol' || h === 'ticker' || h === 'stock');
    const quantityIdx = headerParts.findIndex((h) => h === 'quantity' || h === 'shares' || h === 'qty');
    const exchangeIdx = headerParts.findIndex((h) => h === 'exchange' || h === 'mic');
    const directionIdx = headerParts.findIndex((h) => h === 'position direction' || h === 'action' || h === 'type' || h === 'side');
    const marketPriceIdx = headerParts.findIndex((h) => h === 'market price' || h === 'price' || h === 'execution price');
    const bookValueMarketIdx = headerParts.findIndex((h) => h.includes('book value (market)') || h === 'book value');
    const currencyIdx = headerParts.findIndex(
      (h) => h === 'market price currency' || h === 'currency' || h.includes('book value currency')
    );
    const dateIdx = headerParts.findIndex((h) => h === 'date' || h === 'trade date');

    const rows: ParsedRow[] = [];
    const isHeaderPresent = symbolIdx !== -1 || quantityIdx !== -1 || dateIdx !== -1;
    const startRowIdx = isHeaderPresent ? 1 : 0;

    for (let i = startRowIdx; i < dataLines.length; i++) {
      const parts = parseCsvLine(dataLines[i]);
      if (parts.length < 2) continue;

      let rawSymbol = symbolIdx !== -1 ? parts[symbolIdx] : (parts[1] || parts[0] || '');
      let rawQty = quantityIdx !== -1 ? parts[quantityIdx] : parts[3];
      let rawPrice = marketPriceIdx !== -1 ? parts[marketPriceIdx] : parts[4];
      let rawBookValue = bookValueMarketIdx !== -1 ? parts[bookValueMarketIdx] : '';
      let rawCurrency = currencyIdx !== -1 ? parts[currencyIdx] : parts[5];
      let rawDirection = directionIdx !== -1 ? parts[directionIdx] : parts[2];
      let rawExchange = exchangeIdx !== -1 ? parts[exchangeIdx] : '';
      let rawDate = dateIdx !== -1 ? parts[dateIdx] : extractedAsOfDate;

      let ticker = (rawSymbol || '').toUpperCase().trim();
      const exchange = (rawExchange || '').toUpperCase().trim();
      const currencyStr = (rawCurrency || '').toUpperCase().trim();

      // Check if Canadian ticker on TSX needing .TO extension
      if ((exchange === 'TSX' || exchange === 'XTSE' || currencyStr === 'CAD') && ticker && !ticker.endsWith('.TO') && !ticker.endsWith('.V') && !ticker.endsWith('.CN')) {
        // Known US symbols traded on TSX fallback check
        if (exchange === 'TSX' || exchange === 'XTSE') {
          ticker = `${ticker}.TO`;
        }
      }

      let type: 'BUY' | 'SELL' = 'BUY';
      const dirStr = (rawDirection || '').toUpperCase().trim();
      if (dirStr === 'SELL' || dirStr === 'SHORT' || dirStr === 'S') {
        type = 'SELL';
      }

      let sharesNum = parseFloat(rawQty);
      let priceNum = parseFloat(rawPrice);
      const bookValueNum = parseFloat(rawBookValue);

      // If Wealthsimple Book Value (Market) exists, calculate average cost per share
      if (!isNaN(bookValueNum) && bookValueNum > 0 && !isNaN(sharesNum) && sharesNum > 0) {
        priceNum = bookValueNum / sharesNum;
      }

      const isCanadian = ticker.endsWith('.TO') || ticker.endsWith('.V') || ticker.endsWith('.CN') || currencyStr === 'CAD';
      const currency: 'USD' | 'CAD' = currencyStr === 'CAD' || currencyStr === 'USD'
        ? (currencyStr as 'USD' | 'CAD')
        : (isCanadian ? 'CAD' : 'USD');

      let isValid = true;
      let errorReason = '';

      if (!ticker) {
        isValid = false;
        errorReason = 'Missing stock symbol';
      } else if (isNaN(sharesNum) || sharesNum <= 0) {
        isValid = false;
        errorReason = 'Invalid shares quantity';
      } else if (isNaN(priceNum) || priceNum <= 0) {
        isValid = false;
        errorReason = 'Invalid execution price';
      }

      rows.push({
        id: i,
        ticker,
        type,
        shares: isNaN(sharesNum) ? 0 : sharesNum,
        price: isNaN(priceNum) ? 0 : priceNum,
        currency,
        date: rawDate || extractedAsOfDate,
        isValid,
        errorReason,
        originalSymbol: rawSymbol,
      });
    }

    return rows;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      processFile(selected);
    }
  };

  const processFile = (selectedFile: File) => {
    setFile(selectedFile);
    setImportStatus(null);
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const rows = parseCsvText(content);
        setParsedRows(rows);
      }
    };
    reader.readAsText(selectedFile);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleRemoveRow = (id: number) => {
    setParsedRows((prev) => prev.filter((r) => r.id !== id));
  };

  const handleClearAll = () => {
    setFile(null);
    setParsedRows([]);
    setImportStatus(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const validRows = parsedRows.filter((r) => r.isValid);
  const invalidRowsCount = parsedRows.length - validRows.length;

  const handleExecuteImport = async () => {
    if (validRows.length === 0) {
      setImportStatus({
        type: 'error',
        message: 'No valid trade records available to import.',
      });
      return;
    }

    setIsSubmitting(true);
    setImportStatus(null);

    try {
      const payloadRecords: CsvTradeImportRecord[] = validRows.map((r) => ({
        ticker: r.ticker,
        type: r.type,
        shares: r.shares,
        price: r.price,
        currency: r.currency,
        date: r.date,
      }));

      const res = await importPortfolioCsvAction(
        payloadRecords,
        mode === 'RESET',
        parseFloat(initialCad) || 10000,
        parseFloat(initialUsd) || 0
      );

      if (res.success) {
        setImportStatus({
          type: 'success',
          message: `Successfully imported ${res.count} holdings/trade records into your portfolio! Database updated.`,
        });
        setParsedRows([]);
        setFile(null);
      } else {
        setImportStatus({
          type: 'error',
          message: res.error || 'Failed to import portfolio CSV.',
        });
      }
    } catch (err: any) {
      setImportStatus({
        type: 'error',
        message: err?.message || 'An unexpected error occurred during CSV import.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 sm:gap-8 w-full max-w-none font-sans selection:bg-emerald-500/30 selection:text-emerald-300">
      
      {/* Top Banner Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-[#0c0c0c]/90 border border-neutral-800 backdrop-blur-2xl shadow-2xl">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 shrink-0">
            <FileSpreadsheet className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-3">
              <span>Import Portfolio CSV</span>
              <span className="px-3 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-mono font-bold">
                Wealthsimple & Broker Compatible
              </span>
            </h1>
            <p className="text-xs text-neutral-400 mt-1 max-w-2xl leading-relaxed">
              Upload Wealthsimple Holdings Export CSVs or standard trade logs to bulk update your stock holdings, trade history, and account balances automatically.
            </p>
          </div>
        </div>

        {/* Download Sample CSV Buttons Deck */}
        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          <button
            type="button"
            onClick={handleDownloadWealthsimpleTemplate}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 text-xs font-bold text-neutral-200 bg-neutral-900 border border-neutral-800 rounded-xl hover:border-emerald-500/40 hover:text-white transition cursor-pointer shadow-md"
          >
            <Download className="h-4 w-4 text-emerald-400" />
            <span>Wealthsimple CSV Sample</span>
          </button>
          
          <button
            type="button"
            onClick={handleDownloadStandardTemplate}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 text-xs font-bold text-neutral-200 bg-neutral-900 border border-neutral-800 rounded-xl hover:border-emerald-500/40 hover:text-white transition cursor-pointer shadow-md"
          >
            <FileText className="h-4 w-4 text-neutral-400" />
            <span>Standard CSV Sample</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Left Upload Controls (1/3), Right Preview Table (2/3) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 items-start">
        
        {/* Left Column: File Dropzone & Configuration */}
        <div className="flex flex-col gap-6 lg:col-span-1">
          
          {/* File Upload Dropzone */}
          <Card className="p-6 border border-neutral-800 rounded-3xl bg-[#0c0c0c]/90 backdrop-blur-2xl flex flex-col gap-5">
            <h3 className="text-sm font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
              <UploadCloud className="h-4 w-4 text-emerald-400" />
              <span>Select CSV File</span>
            </h3>

            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-neutral-800 hover:border-emerald-500/50 rounded-2xl p-6 text-center bg-neutral-950/60 hover:bg-neutral-900/40 transition cursor-pointer flex flex-col items-center justify-center gap-3 group"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,text/csv"
                onChange={handleFileChange}
                className="hidden"
              />
              <div className="p-3.5 rounded-2xl bg-neutral-900 border border-neutral-800 text-neutral-400 group-hover:text-emerald-400 group-hover:border-emerald-500/30 transition">
                <UploadCloud className="h-8 w-8" />
              </div>
              <div>
                <p className="text-xs font-bold text-white group-hover:text-emerald-400 transition">
                  {file ? file.name : 'Click or Drag & Drop CSV here'}
                </p>
                <p className="text-[11px] text-neutral-500 mt-1 leading-relaxed">
                  Supports Wealthsimple <code className="text-neutral-300 font-mono">holdings-report.csv</code> or standard trade logs
                </p>
              </div>
            </div>

            {file && (
              <div className="flex items-center justify-between p-3 rounded-xl bg-neutral-900 border border-neutral-800 text-xs">
                <div className="flex items-center gap-2 truncate">
                  <FileSpreadsheet className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span className="text-neutral-200 font-mono truncate">{file.name}</span>
                </div>
                <button
                  type="button"
                  onClick={handleClearAll}
                  className="text-neutral-500 hover:text-red-400 p-1 transition"
                  title="Clear file"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
          </Card>

          {/* Import Mode Selection */}
          <Card className="p-6 border border-neutral-800 rounded-3xl bg-[#0c0c0c]/90 backdrop-blur-2xl flex flex-col gap-5">
            <h3 className="text-sm font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <span>Import Strategy Mode</span>
            </h3>

            <div className="grid grid-cols-2 gap-2 p-1 bg-neutral-950 border border-neutral-800 rounded-2xl">
              <button
                type="button"
                onClick={() => setMode('RESET')}
                className={`py-2.5 px-3 rounded-xl text-xs font-black uppercase transition cursor-pointer flex items-center justify-center gap-2 ${
                  mode === 'RESET'
                    ? 'bg-emerald-500 text-black shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Reset & Overwrite</span>
              </button>

              <button
                type="button"
                onClick={() => setMode('APPEND')}
                className={`py-2.5 px-3 rounded-xl text-xs font-black uppercase transition cursor-pointer flex items-center justify-center gap-2 ${
                  mode === 'APPEND'
                    ? 'bg-neutral-800 text-white border border-neutral-700 shadow-sm'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                <PlusCircle className="h-3.5 w-3.5" />
                <span>Append</span>
              </button>
            </div>

            <p className="text-xs text-neutral-400 leading-relaxed bg-neutral-950/60 p-3 rounded-xl border border-neutral-800/80">
              {mode === 'RESET' ? (
                <span>
                  <strong className="text-emerald-400">Reset & Overwrite Mode (Recommended):</strong> Clears current portfolio holdings and history, setting a clean slate matching your CSV file.
                </span>
              ) : (
                <span>
                  <strong className="text-white">Append Mode:</strong> Merges imported CSV trades directly into your existing portfolio without deleting current records.
                </span>
              )}
            </p>

            {/* Overwrite Mode Cash Initial Balances */}
            {mode === 'RESET' && (
              <div className="flex flex-col gap-3 pt-2 border-t border-neutral-800/80">
                <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest">
                  Initial Cash Balance Override
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-neutral-500 font-bold">🇨🇦 CAD Cash</label>
                    <input
                      type="number"
                      value={initialCad}
                      onChange={(e) => setInitialCad(e.target.value)}
                      placeholder="10000"
                      className="px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs font-mono font-bold text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-neutral-500 font-bold">🇺🇸 USD Cash</label>
                    <input
                      type="number"
                      value={initialUsd}
                      onChange={(e) => setInitialUsd(e.target.value)}
                      placeholder="0"
                      className="px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs font-mono font-bold text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Submit Action Button */}
            <button
              type="button"
              onClick={handleExecuteImport}
              disabled={isSubmitting || validRows.length === 0}
              className={`w-full py-3 px-4 rounded-xl font-extrabold text-xs uppercase tracking-wider transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer ${
                isSubmitting || validRows.length === 0
                  ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed border border-neutral-700'
                  : 'bg-emerald-500 hover:bg-emerald-400 text-black shadow-[0_0_20px_rgba(16,185,129,0.35)]'
              }`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-black" />
                  <span>Processing CSV Import...</span>
                </>
              ) : (
                <>
                  <span>Import {validRows.length} Holdings</span>
                  <ArrowRight className="h-4 w-4 stroke-3" />
                </>
              )}
            </button>
          </Card>

          {/* Feedback Status Box */}
          {importStatus && (
            <div
              className={`p-4 rounded-2xl border text-xs leading-relaxed flex items-start gap-3 ${
                importStatus.type === 'success'
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                  : 'bg-red-500/10 border-red-500/30 text-red-300'
              }`}
            >
              {importStatus.type === 'success' ? (
                <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <p className="font-bold">{importStatus.message}</p>
                {importStatus.type === 'success' && (
                  <div className="mt-2 flex gap-3">
                    <Link
                      href="/dashboard"
                      className="text-emerald-400 underline hover:text-white font-bold"
                    >
                      View Portfolio Overview &rarr;
                    </Link>
                    <Link
                      href="/dashboard/stocks"
                      className="text-emerald-400 underline hover:text-white font-bold"
                    >
                      View Stock Market &rarr;
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Live CSV Data Preview Table */}
        <div className="lg:col-span-2">
          <Card className="p-0 overflow-hidden border border-neutral-800 rounded-3xl bg-[#0c0c0c]/90 backdrop-blur-2xl shadow-2xl">
            {/* Table Header Toolbar */}
            <div className="px-6 py-4.5 border-b border-neutral-800 bg-[#080808]/90 flex items-center justify-between">
              <div>
                <h3 className="text-xs sm:text-sm font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
                  <span>Parsed CSV Holdings Preview</span>
                  {parsedRows.length > 0 && (
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono font-bold">
                      {validRows.length} Valid Rows
                    </span>
                  )}
                </h3>
                <p className="text-[10px] text-neutral-400 font-medium mt-0.5">
                  Review trade data before executing portfolio database update
                </p>
              </div>

              {invalidRowsCount > 0 && (
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center gap-1.5">
                  <AlertTriangle className="h-3 w-3" />
                  <span>{invalidRowsCount} Invalid Rows Skipped</span>
                </span>
              )}
            </div>

            {/* Table or Empty Dropzone Placeholder */}
            {parsedRows.length === 0 ? (
              <div className="p-12 text-center flex flex-col items-center justify-center gap-3">
                <FileSpreadsheet className="h-12 w-12 text-neutral-700" />
                <p className="text-xs font-bold text-neutral-400">No CSV file loaded</p>
                <p className="text-[11px] text-neutral-500 max-w-sm leading-relaxed">
                  Upload a Wealthsimple <code className="text-neutral-300 font-mono">holdings-report.csv</code> or standard trade log using the file dropzone on the left to preview your holdings here.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-neutral-800 text-neutral-400 font-bold uppercase tracking-wider text-[10px] bg-[#080808]/70">
                      <th className="py-3 px-4">As Of Date</th>
                      <th className="py-3 px-4">Symbol / Ticker</th>
                      <th className="py-3 px-3">Position</th>
                      <th className="py-3 px-4 text-right">Quantity</th>
                      <th className="py-3 px-4 text-right">Avg Cost / Price</th>
                      <th className="py-3 px-3 text-center">Currency</th>
                      <th className="py-3 px-4 text-right">Book Value</th>
                      <th className="py-3 px-3 text-center">Status</th>
                      <th className="py-3 px-3 text-right">Remove</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800/60 font-mono text-xs">
                    {parsedRows.map((row) => {
                      const totalBookVal = row.shares * row.price;
                      return (
                        <tr
                          key={row.id}
                          className={`transition-colors ${
                            !row.isValid
                              ? 'bg-red-500/5 hover:bg-red-500/10'
                              : 'hover:bg-neutral-900/60'
                          }`}
                        >
                          <td className="py-3 px-4 text-neutral-400">{row.date}</td>
                          
                          <td className="py-3 px-4 font-bold text-white">
                            <div className="flex items-center gap-2.5">
                              <StockLogo ticker={row.ticker} size={24} />
                              <span className="text-xs font-extrabold">{row.ticker || '—'}</span>
                            </div>
                          </td>

                          <td className="py-3 px-3 font-sans">
                            <span
                              className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider ${
                                row.type === 'BUY'
                                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                                  : 'bg-red-500/10 text-red-400 border border-red-500/30'
                              }`}
                            >
                              {row.type === 'BUY' ? 'LONG' : 'SELL'}
                            </span>
                          </td>

                          <td className="py-3 px-4 text-right font-bold text-white">
                            {row.shares > 0 ? row.shares.toLocaleString() : '—'}
                          </td>

                          <td className="py-3 px-4 text-right font-bold text-white">
                            {row.price > 0 ? `$${row.price.toFixed(2)}` : '—'}
                          </td>

                          <td className="py-3 px-3 text-center font-sans">
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-neutral-900 text-neutral-300 border border-neutral-800">
                              {row.currency === 'CAD' ? '🇨🇦 CAD' : '🇺🇸 USD'}
                            </span>
                          </td>

                          <td className="py-3 px-4 text-right font-bold text-emerald-400">
                            {totalBookVal > 0
                              ? `${row.currency === 'CAD' ? 'CA$' : '$'}${totalBookVal.toLocaleString(
                                  undefined,
                                  { minimumFractionDigits: 2, maximumFractionDigits: 2 }
                                )}`
                              : '—'}
                          </td>

                          <td className="py-3 px-3 text-center">
                            {row.isValid ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400">
                                <CheckCircle2 className="h-3 w-3" /> Valid
                              </span>
                            ) : (
                              <span
                                className="inline-flex items-center gap-1 text-[10px] font-bold text-red-400"
                                title={row.errorReason}
                              >
                                <AlertTriangle className="h-3 w-3" /> Invalid
                              </span>
                            )}
                          </td>

                          <td className="py-3 px-3 text-right">
                            <button
                              type="button"
                              onClick={() => handleRemoveRow(row.id)}
                              className="text-neutral-500 hover:text-red-400 p-1 transition"
                              title="Remove row"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
