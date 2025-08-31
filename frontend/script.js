class Calculator {
    constructor() {
        this.previousOperand = '';
        this.currentOperand = '0';
        this.operation = undefined;
        this.history = [];
        this.shouldResetScreen = false;
        
        this.initializeEventListeners();
        this.loadHistory();
    }
    
    initializeEventListeners() {
        // Botões numéricos
        document.querySelectorAll('.btn.number').forEach(button => {
            button.addEventListener('click', () => {
                this.appendNumber(button.dataset.number);
            });
        });
        
        // Botões de operação
        document.querySelectorAll('.btn.operator').forEach(button => {
            button.addEventListener('click', () => {
                const action = button.dataset.action;
                this.handleOperation(action);
            });
        });
        
        // Botão igual
        document.querySelector('.btn[data-action="equals"]').addEventListener('click', () => {
            this.compute();
        });
        
        // Botão limpar histórico
        document.getElementById('clear-history').addEventListener('click', () => {
            this.clearHistory();
        });
        
        // Teclado
        document.addEventListener('keydown', (e) => {
            this.handleKeyboard(e);
        });
    }
    
    appendNumber(number) {
        if (this.shouldResetScreen) {
            this.currentOperand = '';
            this.shouldResetScreen = false;
        }
        
        if (number === '.' && this.currentOperand.includes('.')) return;
        if (this.currentOperand === '0' && number !== '.') {
            this.currentOperand = number;
        } else {
            this.currentOperand += number;
        }
        this.updateDisplay();
    }
    
    handleOperation(action) {
        switch (action) {
            case 'clear':
                this.clear();
                break;
            case 'delete':
                this.delete();
                break;
            case 'percent':
                this.percentage();
                break;
            case 'add':
                this.chooseOperation('+');
                break;
            case 'subtract':
                this.chooseOperation('−');
                break;
            case 'multiply':
                this.chooseOperation('×');
                break;
            case 'divide':
                this.chooseOperation('÷');
                break;
            case 'power':
                this.chooseOperation('^');
                break;
        }
    }
    
    chooseOperation(operation) {
        if (this.currentOperand === '') return;
        if (this.previousOperand !== '') {
            this.compute();
        }
        this.operation = operation;
        this.previousOperand = this.currentOperand;
        this.currentOperand = '';
        this.updateDisplay();
    }
    
    compute() {
        let computation;
        const prev = parseFloat(this.previousOperand);
        const current = parseFloat(this.currentOperand);
        
        if (isNaN(prev) || isNaN(current)) return;
        
        switch (this.operation) {
            case '+':
                computation = prev + current;
                break;
            case '−':
                computation = prev - current;
                break;
            case '×':
                computation = prev * current;
                break;
            case '÷':
                if (current === 0) {
                    this.showError('Divisão por zero não é permitida!');
                    return;
                }
                computation = prev / current;
                break;
            case '^':
                computation = Math.pow(prev, current);
                break;
            default:
                return;
        }
        
        // Adicionar ao histórico
        const historyItem = `${this.previousOperand} ${this.operation} ${this.currentOperand} = ${computation}`;
        this.addToHistory(historyItem);
        
        this.currentOperand = computation.toString();
        this.operation = undefined;
        this.previousOperand = '';
        this.shouldResetScreen = true;
        this.updateDisplay();
    }
    
    clear() {
        this.currentOperand = '0';
        this.previousOperand = '';
        this.operation = undefined;
        this.updateDisplay();
    }
    
    delete() {
        if (this.currentOperand === '0') return;
        this.currentOperand = this.currentOperand.toString().slice(0, -1);
        if (this.currentOperand === '') {
            this.currentOperand = '0';
        }
        this.updateDisplay();
    }
    
    percentage() {
        const current = parseFloat(this.currentOperand);
        if (isNaN(current)) return;
        this.currentOperand = (current / 100).toString();
        this.updateDisplay();
    }
    
    updateDisplay() {
        document.getElementById('current-operand').textContent = this.currentOperand;
        if (this.operation != null) {
            document.getElementById('previous-operand').textContent = 
                `${this.previousOperand} ${this.operation}`;
        } else {
            document.getElementById('previous-operand').textContent = '';
        }
    }
    
    addToHistory(item) {
        this.history.unshift(item);
        if (this.history.length > 10) {
            this.history.pop();
        }
        this.saveHistory();
        this.updateHistoryDisplay();
    }
    
    updateHistoryDisplay() {
        const historyList = document.getElementById('history-list');
        historyList.innerHTML = '';
        
        this.history.forEach(item => {
            const historyItem = document.createElement('div');
            historyItem.className = 'history-item';
            historyItem.textContent = item;
            historyList.appendChild(historyItem);
        });
    }
    
    clearHistory() {
        this.history = [];
        this.saveHistory();
        this.updateHistoryDisplay();
    }
    
    saveHistory() {
        localStorage.setItem('calculatorHistory', JSON.stringify(this.history));
    }
    
    loadHistory() {
        const saved = localStorage.getItem('calculatorHistory');
        if (saved) {
            this.history = JSON.parse(saved);
            this.updateHistoryDisplay();
        }
    }
    
    showError(message) {
        // Criar notificação de erro
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #fed7d7;
            color: #c53030;
            padding: 15px 20px;
            border-radius: 8px;
            border: 2px solid #feb2b2;
            font-weight: 500;
            z-index: 1000;
            animation: slideIn 0.3s ease;
        `;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // Remover após 3 segundos
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
    
    handleKeyboard(e) {
        if (e.key >= '0' && e.key <= '9' || e.key === '.') {
            this.appendNumber(e.key);
        } else if (e.key === '+') {
            this.chooseOperation('+');
        } else if (e.key === '-') {
            this.chooseOperation('−');
        } else if (e.key === '*') {
            this.chooseOperation('×');
        } else if (e.key === '/') {
            e.preventDefault();
            this.chooseOperation('÷');
        } else if (e.key === '^') {
            this.chooseOperation('^');
        } else if (e.key === 'Enter' || e.key === '=') {
            this.compute();
        } else if (e.key === 'Escape') {
            this.clear();
        } else if (e.key === 'Backspace') {
            this.delete();
        } else if (e.key === '%') {
            this.percentage();
        }
    }
}

// Adicionar estilos CSS para animações
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Inicializar a calculadora quando a página carregar
document.addEventListener('DOMContentLoaded', () => {
    new Calculator();
    
    // Adicionar efeito de loading
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.5s ease';
    
    setTimeout(() => {
        document.body.style.opacity = '1';
    }, 100);
});