[Setup]
AppName=PDF Deleter Native Helper
AppVersion=1.1
DefaultDirName={userappdata}\PDFDeleter
DisableProgramGroupPage=yes
DisableDirPage=yes
OutputBaseFilename=PDFDeleterSetup
PrivilegesRequired=lowest

[Files]
Source: "dist\pdf_deleter_helper.exe"; DestDir: "{app}"; Flags: ignoreversion

[Code]
procedure CurStepChanged(CurStep: TSetupStep);
var
  JsonContent: String;
  FilePath: String;
begin
  if CurStep = ssPostInstall then
  begin
    FilePath := ExpandConstant('{app}\pdf_deleter_helper.exe');
    StringChangeEx(FilePath, '\', '\\', True);

    JsonContent := '{' + #13#10 +
      '  "name": "com.pdf.deleter",' + #13#10 +
      '  "description": "Moves local PDF files to Windows Recycle Bin",' + #13#10 +
      '  "path": "' + FilePath + '",' + #13#10 +
      '  "type": "stdio",' + #13#10 +
      '  "allowed_origins": [' + #13#10 +
      '    "chrome-extension://fdhgkhccehegdfbfgjkodkkfaodhaefg/"' + #13#10 +
      '  ]' + #13#10 +
      '}';

    SaveStringToFile(ExpandConstant('{app}\com.pdf.deleter.json'), JsonContent, False);
  end;
end;

[Registry]
; Google Chrome
Root: HKCU; Subkey: "Software\Google\Chrome\NativeMessagingHosts\com.pdf.deleter"; ValueType: string; ValueData: "{app}\com.pdf.deleter.json"; Flags: uninsdeletekey

; Microsoft Edge
Root: HKCU; Subkey: "Software\Microsoft\Edge\NativeMessagingHosts\com.pdf.deleter"; ValueType: string; ValueData: "{app}\com.pdf.deleter.json"; Flags: uninsdeletekey

; Brave Browser
Root: HKCU; Subkey: "Software\BraveSoftware\Brave-Browser\NativeMessagingHosts\com.pdf.deleter"; ValueType: string; ValueData: "{app}\com.pdf.deleter.json"; Flags: uninsdeletekey