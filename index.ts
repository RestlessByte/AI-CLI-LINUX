import { usingMistral as home } from '/home/localhost/main/telegram/hub/usingAI/mistral/index';
import * as readline from 'readline';
import { execSync } from 'child_process';
import * as fs from 'fs';
import os from 'os';
import path from 'path';
import { usingAI } from './core/ai';
const ai = home as any ? home : usingAI
// Конфигурация
const CONTEXT_FILE = path.join(os.homedir(), '.terminal_assistant_context.json');
const MAX_HISTORY = 20; // Максимальное количество сообщений в истории
const SAFE_COMMANDS = ['ls', 'cd', 'cat', 'ps', 'pm2', 'git', 'npm', 'bun', 'echo', 'mkdir', 'touch'];
const DANGEROUS_PATTERNS = [
  'rm -rf', 'sudo', 'dd', 'mv', 'chmod', '>', '|', '&', ';', '`',
  '$', '(', ')', '{', '}', '[', ']', '~', '..', 'pkill', 'kill'
];

// Типы данных
interface MistralResponse {
  message: string;
  command: string;
}

interface Context {
  history: Array<{ role: string; content: string }>;
  workingDirectory: string;
}

// Инициализация контекста
let context: Context = {
  history: [],
  workingDirectory: process.cwd()
};

// Загрузка сохраненного контекста
function loadContext(): void {
  try {
    if (fs.existsSync(CONTEXT_FILE)) {
      const data = fs.readFileSync(CONTEXT_FILE, 'utf-8');
      context = JSON.parse(data);
      console.log(`📂 Загружен контекст из ${CONTEXT_FILE}`);
    }
  } catch (error) {
    console.warn('⚠️ Не удалось загрузить контекст:', error);
  }
}

// Сохранение контекста
function saveContext(): void {
  try {
    fs.writeFileSync(CONTEXT_FILE, JSON.stringify(context, null, 2));
  } catch (error) {
    console.warn('⚠️ Не удалось сохранить контекст:', error);
  }
}

// Обновление рабочей директории
function updateWorkingDirectory(): void {
  try {
    context.workingDirectory = process.cwd();
    console.log(`📂 Рабочая директория: ${context.workingDirectory}`);
  } catch (error) {
    console.warn('⚠️ Не удалось обновить рабочую директорию:', error);
  }
}

// Добавление сообщения в историю
function addToHistory(role: string, content: string): void {
  context.history.push({ role, content });

  // Ограничиваем размер истории
  if (context.history.length > MAX_HISTORY) {
    context.history = context.history.slice(context.history.length - MAX_HISTORY);
  }
}

// Получение системного промпта с контекстом
function getSystemPrompt(userInput: string): string {
  return `Ты ассистент в терминале Linux. Текущая директория: ${context.workingDirectory}
Система: ${os.platform()} ${os.arch()}
Дата: ${new Date().toLocaleString()}
  
Правила:
1. Отвечай ТОЛЬКО в JSON формате: { "message": "текст", "command": "команда" }
2. Если команда не нужна - оставь "command": ""
3. Избегай опасных команд (rm, sudo, >, | и т.д.)
4. Учитывай историю диалога:
${context.history.slice(-5).map(m => `${m.role}: ${m.content}`).join('\n')}

Запрос пользователя: ${userInput}`;
}

// Обработка команды с учетом контекста
async function processWithMistral(input: string): Promise<MistralResponse> {
  addToHistory('user', input);

  try {
    const response = (await ai(
      `Запрос: ${input}`,
      getSystemPrompt(input)
    )).choices[0].message.content;

    // Извлекаем JSON из ответа
    const jsonStart = response.indexOf('{');
    const jsonEnd = response.lastIndexOf('}') + 1;

    if (jsonStart === -1 || jsonEnd === 0) {
      throw new Error('JSON не найден в ответе');
    }

    const jsonString = response.substring(jsonStart, jsonEnd);
    const result = JSON.parse(jsonString) as MistralResponse;

    // Сохраняем ответ в историю
    addToHistory('assistant', result.message);

    return result;
  } catch (error) {
    // Возвращаем ошибку как сообщение
    const errorMessage = `Ошибка: ${error instanceof Error ? error.message : error}`;
    addToHistory('assistant', errorMessage);
    return {
      message: errorMessage,
      command: ""
    };
  }
}

// Безопасное выполнение команды
async function executeCommandSafely(command: string): Promise<void> {
  try {
    // Проверка безопасности
    const isDangerous = DANGEROUS_PATTERNS.some(p => command.includes(p)) &&
      !SAFE_COMMANDS.some(s => command.startsWith(s));

    if (isDangerous) {
      throw new Error(`Запрещённая команда: ${command}`);
    }

    // Выполнение команды
    console.log(`🚀 Выполняю: ${command}`);
    execSync(command, {
      stdio: 'inherit',
      cwd: context.workingDirectory,
      encoding: 'utf-8'
    });

    console.log('✅ Успешно выполнено');
    updateWorkingDirectory();
  } catch (error) {
    console.error('❌ Ошибка выполнения:', error instanceof Error ? error.message : error);
    throw error;
  }
}

// Обработка специальных команд
function handleSpecialCommands(input: string): boolean {
  const trimmed = input.trim().toLowerCase();

  if (trimmed === 'context') {
    console.log('📋 История контекста:');
    console.log(context.history.map((m, i) => `${i + 1}. ${m.role}: ${m.content}`).join('\n'));
    return true;
  }

  if (trimmed === 'clear-context') {
    context.history = [];
    console.log('🧹 Контекст очищен');
    return true;
  }

  if (trimmed === 'pwd') {
    console.log(`📂 Текущая директория: ${context.workingDirectory}`);
    return true;
  }

  return false;
}

// Основная функция
async function main() {
  // Загрузка контекста
  loadContext();

  // Проверка режима работы
  if (process.stdin.isTTY) {
    // Интерактивный режим
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    console.log('Терминальный ассистент (для выхода: exit, история: context)');
    updateWorkingDirectory();

    rl.on('line', async (input) => {
      const trimmedInput = input.trim();

      try {
        if (trimmedInput === 'exit') {
          rl.close();
          return;
        }

        if (trimmedInput === 'prompt') {
          console.log('prompt');
          return;
        }

        // Обработка специальных команд
        if (handleSpecialCommands(trimmedInput)) {
          return;
        }

        // Обработка через Mistral
        const response = await processWithMistral(trimmedInput);

        // Вывод сообщения
        if (response.message) {
          console.log(`💬 ${response.message}`);
        }

        // Выполнение команды
        if (response.command) {
          await executeCommandSafely(response.command);
        }
      } catch (error) {
        console.error('⚠️ Ошибка:', error instanceof Error ? error.message : error);
      } finally {
        // Сохраняем контекст после каждой операции
        saveContext();
      }
    });

    rl.on('close', () => {
      console.log('👋 Программа завершена');
      saveContext();
      process.exit(0);
    });
  } else {
    // Пакетный режим
    let inputData = '';
    process.stdin.setEncoding('utf-8');
    process.stdin.on('data', chunk => inputData += chunk);

    process.stdin.on('end', async () => {
      try {
        const response = await processWithMistral(inputData.trim());

        if (response.message) {
          console.log(`💬 ${response.message}`);
        }

        if (response.command) {
          await executeCommandSafely(response.command);
        }
      } catch (error) {
        console.error('⚠️ Ошибка:', error instanceof Error ? error.message : error);
      } finally {
        saveContext();
        process.exit(0);
      }
    });
  }
}

// Запуск программы
main().catch(error => {
  console.error('🔥 Критическая ошибка:', error);
  process.exit(1);
});