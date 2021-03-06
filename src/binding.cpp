#define SECURITY_WIN32 1

#include <node.h>
#include <nan.h>
#include <v8.h>

#ifdef _WIN32
#include <Windows.h>
#include <Sddl.h>
#endif

namespace {

#ifdef _WIN32
    std::string utf8_encode(const std::wstring &wstr) {
        if (wstr.empty()) return std::string();
        int size_needed = WideCharToMultiByte(CP_UTF8, 0, &wstr[0], (int) wstr.size(), NULL, 0, NULL, NULL);
        std::string strTo(size_needed, 0);
        WideCharToMultiByte(CP_UTF8, 0, &wstr[0], (int) wstr.size(), &strTo[0], size_needed, NULL, NULL);
        return strTo;
    }

    std::string GetLastErrorAsString() {
        DWORD errorMessageID = ::GetLastError();
        if (errorMessageID == 0)
            return std::string();

        DWORD flags = FORMAT_MESSAGE_ALLOCATE_BUFFER | FORMAT_MESSAGE_FROM_SYSTEM | FORMAT_MESSAGE_IGNORE_INSERTS;
        DWORD languageId = MAKELANGID(LANG_NEUTRAL, SUBLANG_DEFAULT);
        LPSTR messageBuffer = NULL;
        size_t size = FormatMessageA(flags, NULL, errorMessageID, languageId, (LPSTR)&messageBuffer, 0, NULL);

        std::string message(messageBuffer, size);
        LocalFree(messageBuffer);
        return message;
    }

    std::string getSidTypeString(SID_NAME_USE snu) {
        switch(snu) {
            case SidTypeUser:
                return "User";
            case SidTypeGroup:
                return "Group";
            case SidTypeDomain:
                return "Domain";
            case SidTypeAlias:
                return "Alias";
            case SidTypeWellKnownGroup:
                return "WellKnownGroup";
            case SidTypeDeletedAccount:
                return "DeletedAccount";
            case SidTypeInvalid:
                return "Invalid";
            case SidTypeUnknown:
                return "Unknown";
            case SidTypeComputer:
                return "Computer";
            case SidTypeLabel:
                return "Label";
            default:
                return "Unknown";
        }
    }

#endif

    class GetSidForUser : public Nan::AsyncWorker {
    public:
        GetSidForUser(Nan::Callback *callback, const std::string &user)
                : Nan::AsyncWorker(callback), user(user), sid("") { }

        ~GetSidForUser() { }

        virtual void Execute() {
#ifdef _WIN32
            LPCWSTR lpSystemName = NULL;

            std::wstring swUser = std::wstring(user.begin(), user.end());
            LPCWSTR lpAccountName = swUser.c_str();

            DWORD cbSid = 256;
            BYTE pSid[256];

            DWORD cbDomain = 256 / sizeof(WCHAR);
            WCHAR Domain[256];

            SID_NAME_USE snu;

            if (!LookupAccountNameW(lpSystemName, lpAccountName, pSid, &cbSid, Domain, &cbDomain, &snu)) {
                SetErrorMessage(GetLastErrorAsString().c_str());
                return;
            }

            if (IsValidSid(pSid) == FALSE) {
                std::string msg = "No SID found for user \"" + user + "\".";
                SetErrorMessage(msg.c_str());
                return;
            }

            if (snu != SidTypeUser) {
                std::string msg = "The provided name must belong to a User, but the according SID is of type \"" + getSidTypeString(snu) + "\".";
                SetErrorMessage(msg.c_str());
                return;
            }

            LPTSTR sidStr;
            if (ConvertSidToStringSid(pSid, &sidStr) == FALSE) {
                SetErrorMessage(GetLastErrorAsString().c_str());
                return;
            }

            sid = utf8_encode(sidStr);
#else
            SetErrorMessage("Your operating system is not supported.");
#endif
        }

        void HandleErrorCallback() {
            Nan::HandleScope scope;
            v8::Local <v8::Value> argv[] = { Nan::Error(ErrorMessage() )};
            callback->Call(Nan::GetCurrentContext()->Global(), 1, argv, async_resource);
        }

        void HandleOKCallback() {
            Nan::HandleScope scope;
            v8::Local <v8::Value> returnValue = Nan::New<v8::String>((char *) sid.data(), sid.size()).ToLocalChecked();
            v8::Local <v8::Value> argv[] = { Nan::Null(), returnValue };
            callback->Call(Nan::GetCurrentContext()->Global(), 2, argv, async_resource);
        }

    private:
        std::string user;
        std::string sid;
    };

    NAN_METHOD(getSidForUser) {
        Nan::Utf8String user(info[0]);
        Nan::Callback *callback = new Nan::Callback(info[1].As<v8::Function>());
        Nan::AsyncQueueWorker(new GetSidForUser(callback, *user));
    }

    NAN_MODULE_INIT(init) {
        Nan::HandleScope scope;
        Nan::SetMethod(target, "getSidForUser", getSidForUser);
    }

    NODE_MODULE(windows_sid, init)

} // anonymous namespace
