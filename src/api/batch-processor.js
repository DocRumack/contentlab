import { ClaudeCodeHelper } from './claude-code-helpers.js';

export class BatchProcessor {
  constructor(api) {
    this.api = api;
    this.helper = new ClaudeCodeHelper(api);
    this.results = [];
  }

  async processBatch(formulas, options = {}) {
    const { 
      saveProgress = true, 
      parallel = false,
      onProgress = null 
    } = options;
    
    console.log(`Starting batch processing of ${formulas.length} formulas`);
    
    for (let i = 0; i < formulas.length; i++) {
      const formula = formulas[i];
      
      try {
        const result = await this.helper.processFormula(formula);
        this.results.push(result);
        
        if (onProgress) {
          onProgress(i + 1, formulas.length, result);
        }
        
        if (saveProgress) {
          this.saveProgress(i, result);
        }
        
      } catch (error) {
        console.error(`Error processing formula ${i}:`, error);
        this.results.push({
          original: formula,
          error: error.message
        });
      }
      
      // Small delay between formulas
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    return this.generateReport();
  }

  generateReport() {
    return {
      total: this.results.length,
      successful: this.results.filter(r => !r.error).length,
      failed: this.results.filter(r => r.error).length,
      averageIterations: this.calculateAverageIterations(),
      results: this.results
    };
  }

  calculateAverageIterations() {
    const successful = this.results.filter(r => !r.error && r.iterations);
    if (successful.length === 0) return 0;
    
    const total = successful.reduce((sum, r) => sum + r.iterations, 0);
    return (total / successful.length).toFixed(2);
  }

  saveProgress(index, result) {
    // Save to localStorage or another persistence mechanism
    const key = `batch_progress_${Date.now()}`;
    const progress = {
      index: index,
      total: this.results.length,
      timestamp: new Date().toISOString(),
      result: result
    };
    
    // In a browser environment:
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        window.localStorage.setItem(key, JSON.stringify(progress));
      } catch (e) {
        console.warn('Could not save progress:', e);
      }
    }
  }

  clearResults() {
    this.results = [];
  }

  getResults() {
    return this.results;
  }

  async exportResults(format = 'json') {
    const report = this.generateReport();
    
    if (format === 'json') {
      return JSON.stringify(report, null, 2);
    } else if (format === 'csv') {
      return this.exportAsCSV(report);
    } else if (format === 'markdown') {
      return this.exportAsMarkdown(report);
    }
    
    return report;
  }

  exportAsCSV(report) {
    let csv = 'Original,Beautified,Iterations,Error\n';
    
    for (const result of report.results) {
      const original = (result.original || '').replace(/"/g, '""');
      const beautified = (result.beautified || '').replace(/"/g, '""');
      const iterations = result.iterations || 0;
      const error = result.error || '';
      
      csv += `"${original}","${beautified}",${iterations},"${error}"\n`;
    }
    
    return csv;
  }

  exportAsMarkdown(report) {
    let md = '# Batch Processing Report\n\n';
    md += `- **Total Formulas**: ${report.total}\n`;
    md += `- **Successful**: ${report.successful}\n`;
    md += `- **Failed**: ${report.failed}\n`;
    md += `- **Average Iterations**: ${report.averageIterations}\n\n`;
    
    md += '## Results\n\n';
    md += '| Original | Beautified | Iterations | Status |\n';
    md += '|----------|------------|------------|--------|\n';
    
    for (const result of report.results) {
      const status = result.error ? '❌ Error' : '✅ Success';
      const original = result.original || '';
      const beautified = result.beautified || result.error || '';
      const iterations = result.iterations || 0;
      
      md += `| \`${original}\` | \`${beautified}\` | ${iterations} | ${status} |\n`;
    }
    
    return md;
  }
}