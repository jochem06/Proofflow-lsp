# ProofFlow-LSP
SEP Group 12 - 2024 - ProofFlow

## Introduction
**ProofFlow-LSP** is a language server for ProofFlow. It is a server that provides 
language-specific features to the standard ProofFlow editor.



## Pre-requisites:
Ensure that you have already installed **ProofFlow** on your device. 
If not, refer to this repository for more information and 
follow all the steps listed on [ProofFlow](https://github.com/Moonlington/ProofFlow.git).

You will also need to have the appropriate theorem proving languages and their LSP servers installed on your device:
- **Lean**:
  To install **Lean** the instructions [here](https://leanprover-community.github.io/get_started.html) need to be followed.

- **Coq**:
  To install **Coq** with the **Waterproof** plugins the 
  instructions [here](https://github.com/impermeable/waterproof-vscode) need to be followed. 
  The VS Code extension itself does not need to be installed

## How to Install ProofFlow-LSP:
Clone the repository for ProofFlow-LSP by running
the following command:
```
git clone https://github.com/jochem06/Proofflow-lsp.git
```
To navigate to the directory run the following command: 
```
cd Proofflow-lsp
```
To install the node dependencies of ProofFlow the following command must be
   run: 
```
npm install
```
With this command the program can be build and
deployed locally:
```
npm run dev
```

## How to use ProofFlow-LSP with ProofFlow:
Once you have installed the **ProofFlow-LSP** along with the **Pre-requisites**, 
then you can use the LSP features in **ProofFlow** by also following these steps:

1. Open the **ProofFlow** editor 
2. Select the settings menu in the top right corner of the editor (the gear icon)
3. Copy paste the path to the appropriate LSP servers for the chosen language in the settings menu
4. Press `'Apply'`

The LSP servers for the languages are usually an executable file (`coq-lsp.exe`, `lean.exe`). 
If you cannot find these files, keep in mind they are usually installed 
in the directory of whichever installer you used; in this case either `brew`, `opam`, or something else.

## Files to be checked for Code Quality Assesment:
Only `src/serverScript.ts` and `src/newModels.ts`, as everything else in this repository has been copied, unmodified from Raffaele Fioratto's original LSP [repository](https://github.com/ImperiumMaximus/ts-lsp-client)
