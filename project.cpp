#include <iostream>
#include <vector>
#include <string>
#include <queue>
#include <unordered_map> 
#include <algorithm>
#include <cctype> 

using namespace std;

struct TrieNode {
    unordered_map<char, TrieNode*> children; 
    bool isEndOfWord;
    int frequency;
    string word;
    
    TrieNode() : isEndOfWord(false), frequency(0), word("") {}
};


struct Compare {
    bool operator()(const pair<string, int>& a, const pair<string, int>& b) {
        if (a.second == b.second) {
            return a.first > b.first; 
        }
        return a.second < b.second; 
    }
};

class AutocompleteChatbot {
private:
    TrieNode* root;
    

    string toLowerCase(const string& str) {
        string result = str;
        transform(result.begin(), result.end(), result.begin(), ::tolower);
        return result;
    }
    

    void collectWords(TrieNode* node, vector<pair<string, int>>& words) {
        if (node->isEndOfWord) {
            words.push_back({node->word, node->frequency});
        }
        
        for (auto& child : node->children) {
            collectWords(child.second, words);
        }
    }
    
    
    void deleteTrie(TrieNode* node) {
        if (!node) return;
        for (auto& child : node->children) {
            deleteTrie(child.second);
        }
        delete node;
    }
    
public:
    AutocompleteChatbot() {
        root = new TrieNode();
        initializeDefaultWords();
    }
    
    ~AutocompleteChatbot() {
        deleteTrie(root);
    }
    
    
    void initializeDefaultWords() {
        vector<pair<string, int>> defaultWords = {
            {"hello", 10}, {"help", 8}, {"how", 7}, {"house", 5}, {"happy", 6},
            {"computer", 9}, {"code", 12}, {"coding", 8}, {"cool", 4}, {"cat", 3},
            {"chatbot", 15}, {"chat", 10}, {"change", 6}, {"challenge", 7},
            {"programming", 11}, {"program", 9}, {"project", 8}, {"practice", 5},
            {"python", 7}, {"java", 6}, {"javascript", 8}, {"algorithm", 9},
            {"data", 10}, {"structure", 8}, {"database", 6}, {"design", 7},
            {"development", 9}, {"developer", 8}, {"debug", 5}, {"deploy", 4},
            {"machine", 6}, {"learning", 8}, {"artificial", 5}, {"intelligence", 7},
            {"network", 6}, {"security", 8}, {"software", 10}, {"system", 9},
            {"technology", 7}, {"technical", 6}, {"tutorial", 8}, {"training", 5},
            {"dbms",4},
        };
        
        for (const auto& wordPair : defaultWords) {
            insert(wordPair.first, wordPair.second);
        }
    }
    
    
    void insert(const string& word, int frequency = 1) {
        string lowerWord = toLowerCase(word);
        TrieNode* current = root;
        
        for (char c : lowerWord) {
            if (current->children.find(c) == current->children.end()) {
                current->children[c] = new TrieNode();
            }
            current = current->children[c];
        }
        
        if (current->isEndOfWord) {
            current->frequency += frequency; 
        } else {
            current->isEndOfWord = true;
            current->frequency = frequency;
            current->word = lowerWord;
        }
    }
    
    
    vector<string> getSuggestions(const string& prefix, int maxSuggestions = 5) {
        string lowerPrefix = toLowerCase(prefix);
        TrieNode* current = root;
        
    
        for (char c : lowerPrefix) {
            if (current->children.find(c) == current->children.end()) {
                return {}; 
            }
            current = current->children[c];
        }
        
        
        vector<pair<string, int>> words;
        collectWords(current, words);
        
        
        priority_queue<pair<string, int>, vector<pair<string, int>>, Compare> pq;
        for (const auto& wordPair : words) {
            pq.push(wordPair);
        }
        
        vector<string> suggestions;
        int count = 0;
        while (!pq.empty() && count < maxSuggestions) {
            suggestions.push_back(pq.top().first);
            pq.pop();
            count++;
        }
        
        return suggestions;
    }
    

    bool search(const string& word) {
        string lowerWord = toLowerCase(word);
        TrieNode* current = root;
        
        for (char c : lowerWord) {
            if (current->children.find(c) == current->children.end()) {
                return false;
            }
            current = current->children[c];
        }
        
        return current->isEndOfWord;
    }
    
    
    void processInput(const string& input) {
        if (input.empty()) return;
        
        cout << "\n--- Processing: \"" << input << "\" ---\n";
        
        
        vector<string> suggestions = getSuggestions(input);
        
        if (!suggestions.empty()) {
            cout << "Autocomplete suggestions:\n";
            for (int i = 0; i < suggestions.size(); i++) {
                cout << (i + 1) << ". " << suggestions[i] << "\n";
            }
        } else {
            cout << "No suggestions found for \"" << input << "\"\n";
        }
        
        
        if (search(input)) {
            cout << "Word \"" << input << "\" exists in our database.\n";
            
            insert(input, 1);
            cout << "Increased frequency of \"" << input << "\"\n";
        } else {
            cout << "Word \"" << input << "\" not found in database.\n";
            cout << "Adding \"" << input << "\" to the database with frequency 1.\n";
            insert(input, 1);
        }
    }
    

    void displayStats() {
        cout << "\n=== Chatbot Statistics ===\n";
        cout << "Database contains words starting with common prefixes.\n";
        cout << "Words are ranked by frequency and alphabetical order.\n";
        cout << "New words are automatically added when not found.\n";
    }
};

int main() {
    AutocompleteChatbot chatbot; 
    string input;
    
    cout << "==============================================\n";
    cout << "    AUTOCOMPLETE CHATBOT WITH TRIE & PQ\n";
    cout << "==============================================\n";
    cout << "Enter words or prefixes to get suggestions.\n";
    cout << "Type 'quit' or 'exit' to end the program.\n";
    cout << "Type 'stats' to see statistics.\n";
    cout << "Type 'help' to see available commands.\n";
    cout << "==============================================\n\n";
    
    while (true) {
        cout << "Enter input: ";
        getline(cin, input);
        
    
        string lowerInput = input;
        transform(lowerInput.begin(), lowerInput.end(), lowerInput.begin(), ::tolower);
        
        if (lowerInput == "quit" || lowerInput == "exit") {
            cout << "\nThank you for using the Autocomplete Chatbot!\n";
            break;
        } else if (lowerInput == "stats") {
            chatbot.displayStats();
        } else if (lowerInput == "help") {
            cout << "\n=== Available Commands ===\n";
            cout << "- Type any word or prefix to get suggestions\n";
            cout << "- 'stats' - Display chatbot statistics\n";
            cout << "- 'help' - Show this help menu\n";
            cout << "- 'quit' or 'exit' - End the program\n\n";
        } else if (lowerInput.empty()) {
            cout << "Please enter a valid input.\n";
        } else {
            chatbot.processInput(input);  
        }
        
        cout << "\n" << string(50, '-') << "\n";
    }
    
    return 0;
}