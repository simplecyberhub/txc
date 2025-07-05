import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import {
  AlertCircle,
  Settings,
  ArrowLeft,
  ArrowRight,
  FileCode,
} from "lucide-react";

export default function Home() {
  const [currentStep, setCurrentStep] = useState(3);
  const [command, setCommand] = useState("");
  const [terminalOutput, setTerminalOutput] = useState([
    { type: "command", content: "npm install" },
    {
      type: "output",
      content: [
        "added 1432 packages, and audited 1433 packages in 12s",
        "238 packages are looking for funding",
        "found 0 vulnerabilities",
      ],
      status: "success",
    },
    { type: "command", content: "npm list --depth=0" },
    {
      type: "output",
      content: [
        "my-react-app@0.1.0",
        "├── @testing-library/jest-dom@5.16.5",
        "├── @testing-library/react@13.4.0",
        "├── @testing-library/user-event@13.5.0",
        "├── react@18.2.0",
        "├── react-dom@18.2.0",
        "├── react-scripts@5.0.1",
        "└── web-vitals@2.1.4",
      ],
    },
    {
      type: "command",
      content: 'echo "REACT_APP_API_URL=https://api.example.com" > .env',
    },
    { type: "output", content: ["Created .env file"] },
    { type: "command", content: 'echo "REACT_APP_DEBUG=true" >> .env' },
    { type: "output", content: ["Updated .env file"] },
    { type: "command", content: "cat .env" },
    {
      type: "output",
      content: [
        "REACT_APP_API_URL=https://api.example.com",
        "REACT_APP_DEBUG=true",
        "# REACT_APP_AUTH_KEY is missing",
      ],
      status: "warning",
    },
  ]);

  const [envVars, setEnvVars] = useState([
    {
      name: "REACT_APP_API_URL",
      value: "https://api.example.com",
      isSet: false,
    },
    {
      name: "REACT_APP_AUTH_KEY",
      value: "1GDUIEUGDV3B_vudu88g1H",
      isSet: false,
    },
    { name: "REACT_APP_DEBUG", value: "true", isSet: true },
  ]);

  const [newEnvName, setNewEnvName] = useState("");
  const [newEnvValue, setNewEnvValue] = useState("");

  const handleRunCommand = () => {
    if (!command.trim()) return;

    const newOutput = [...terminalOutput];
    newOutput.push({ type: "command", content: command });

    if (command.includes("npm start")) {
      newOutput.push({
        type: "output",
        content: [
          "Starting the development server...",
          "Compiled successfully!",
          "",
          "You can now view my-react-app in the browser.",
          "",
          "  Local:            http://localhost:3000",
          "  On Your Network:  http://192.168.1.5:3000",
          "",
          "Note that the development build is not optimized.",
          "To create a production build, use npm run build.",
        ],
        status: "success",
      });
    } else if (command.includes("npm test")) {
      newOutput.push({
        type: "output",
        content: [
          "PASS src/App.test.js",
          "  ✓ renders learn react link (32ms)",
          "",
          "Test Suites: 1 passed, 1 total",
          "Tests:       1 passed, 1 total",
          "Snapshots:   0 total",
          "Time:        1.235s",
        ],
        status: "success",
      });
    } else if (command.includes("npm install")) {
      newOutput.push({
        type: "output",
        content: [
          "added 2 packages, and audited 1435 packages in 3s",
          "238 packages are looking for funding",
          "found 0 vulnerabilities",
        ],
        status: "success",
      });
    } else {
      newOutput.push({
        type: "output",
        content: ["Command not recognized or no output to display"],
        status: "warning",
      });
    }

    setTerminalOutput(newOutput);
    setCommand("");
  };

  const handleClearTerminal = () => {
    setTerminalOutput([]);
  };

  const handleAddEnvVar = () => {
    if (!newEnvName.trim() || !newEnvValue.trim()) return;

    setEnvVars([
      ...envVars,
      { name: newEnvName, value: newEnvValue, isSet: true },
    ]);

    setNewEnvName("");
    setNewEnvValue("");
  };

  const handleNextStep = () => {
    const missingEnvVar = envVars.some((env) => !env.isSet);
    if (missingEnvVar) {
      alert(
        "Warning: Some environment variables are missing. It is recommended to set them before proceeding.",
      );
    } else {
      setCurrentStep((prev) => Math.min(prev + 1, 5));
    }
  };

  const handlePreviousStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  return (
    <div className="min-h-screen font-sans text-gray-800 bg-[#f9fafb]">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <FileCode className="h-8 w-8 text-primary" />
              <h1 className="ml-2 text-xl font-semibold text-gray-900">
                Project Setup Assistant
              </h1>
            </div>
            <Button variant="outline" size="sm" className="flex items-center">
              <Settings className="h-5 w-5 mr-2" />
              Settings
            </Button>
          </div>
        </div>
      </header>

      <main className="py-6 px-4 sm:p-6 md:py-10 md:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Setup Progress */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-medium text-gray-900">
                Setup Progress
              </h2>
              <span className="text-sm font-medium text-primary">
                Step {currentStep} of 5
              </span>
            </div>
            <div className="relative">
              <div className="overflow-hidden h-2 flex rounded-full bg-gray-200">
                <div
                  className={`bg-primary w-${currentStep}/5`}
                  style={{ width: `${(currentStep / 5) * 100}%` }}
                ></div>
              </div>
              <div className="mt-4 grid grid-cols-5 text-sm">
                {[1, 2, 3, 4, 5].map((step) => (
                  <div
                    key={step}
                    className={`flex flex-col items-center ${step <= currentStep ? "text-primary font-medium" : "text-gray-500"}`}
                  >
                    <div
                      className={`rounded-full ${step <= currentStep ? "bg-primary text-white" : "border-2 border-gray-300 text-gray-500"} flex items-center justify-center w-8 h-8 mb-1`}
                    >
                      {step < currentStep ? (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      ) : (
                        <span>{step}</span>
                      )}
                    </div>
                    {step === 1 && "Project Type"}
                    {step === 2 && "Dependencies"}
                    {step === 3 && "Environment"}
                    {step === 4 && "Start App"}
                    {step === 5 && "Verify"}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Project Information */}
          <Card className="mb-6">
            <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
              <div>
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Project Information
                </h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                  Details about the detected project configuration.
                </p>
              </div>
              <span className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-green-100 text-green-800">
                <span className="-ml-1 mr-1.5 h-2 w-2 rounded-full bg-green-400"></span>
                Detected
              </span>
            </div>
            <Separator />
            <div>
              <dl>
                <div className="bg-gray-50 px-4 py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">
                    Project name
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    rest-express
                  </dd>
                </div>
                <div className="bg-white px-4 py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">
                    Project type
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-blue-500 mr-1.5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                    React with Express Backend
                  </dd>
                </div>
                <div className="bg-gray-50 px-4 py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">
                    Package manager
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    npm
                  </dd>
                </div>
                <div className="bg-white px-4 py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">
                    Key dependencies
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    <ul className="border border-gray-200 rounded-md divide-y divide-gray-200">
                      <li className="pl-3 pr-4 py-2 flex items-center justify-between text-sm">
                        <div className="w-0 flex-1 flex items-center">
                          <span className="flex-1 w-0 truncate">react</span>
                        </div>
                        <div className="ml-4 flex-shrink-0">
                          <span className="font-medium text-gray-500">
                            v18.3.1
                          </span>
                        </div>
                      </li>
                      <li className="pl-3 pr-4 py-2 flex items-center justify-between text-sm">
                        <div className="w-0 flex-1 flex items-center">
                          <span className="flex-1 w-0 truncate">express</span>
                        </div>
                        <div className="ml-4 flex-shrink-0">
                          <span className="font-medium text-gray-500">
                            v4.21.2
                          </span>
                        </div>
                      </li>
                      <li className="pl-3 pr-4 py-2 flex items-center justify-between text-sm">
                        <div className="w-0 flex-1 flex items-center">
                          <span className="flex-1 w-0 truncate">
                            drizzle-orm
                          </span>
                        </div>
                        <div className="ml-4 flex-shrink-0">
                          <span className="font-medium text-gray-500">
                            v0.39.1
                          </span>
                        </div>
                      </li>
                    </ul>
                  </dd>
                </div>
              </dl>
            </div>
          </Card>

          {/* Environment Configuration */}
          <Card className="mb-6">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Environment Configuration
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                Set up required environment variables for your project.
              </p>
            </div>

            <Separator />

            <div className="px-4 py-3 sm:px-6">
              <div className="space-y-6">
                <div className="sm:flex sm:items-start sm:justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">
                      Environment Variables
                    </h4>
                    <p className="text-sm text-gray-500">
                      Missing environment variables must be set before
                      proceeding.
                    </p>
                  </div>
                  <Button variant="outline" size="sm" className="mt-3 sm:mt-0">
                    Create .env file
                  </Button>
                </div>

                <div className="mt-4 space-y-3">
                  {envVars.map((envVar, index) => (
                    <div key={index} className="flex items-center">
                      <Checkbox
                        id={`env-${index}`}
                        className="h-4 w-4"
                        checked={envVar.isSet}
                      />
                      <label
                        htmlFor={`env-${index}`}
                        className="ml-3 block text-sm font-medium text-gray-700"
                      >
                        {envVar.name}
                      </label>
                      <div className="ml-auto flex items-center">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${envVar.isSet ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
                        >
                          {envVar.isSet ? "Set" : "Missing"}
                        </span>
                        <button
                          type="button"
                          className="ml-2 text-gray-400 hover:text-gray-500"
                        >
                          <svg
                            className="h-5 w-5"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                            aria-hidden="true"
                          >
                            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-900">
                    Add New Environment Variable
                  </h4>
                  <div className="mt-2 flex gap-2">
                    <div className="flex-1">
                      <Input
                        type="text"
                        placeholder="Variable name"
                        value={newEnvName}
                        onChange={(e) => setNewEnvName(e.target.value)}
                      />
                    </div>
                    <div className="flex-1">
                      <Input
                        type="text"
                        placeholder="Value"
                        value={newEnvValue}
                        onChange={(e) => setNewEnvValue(e.target.value)}
                      />
                    </div>
                    <Button onClick={handleAddEnvVar}>Add</Button>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Terminal Output */}
          <Card className="mb-6">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Terminal Output
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                View the results of your setup commands.
              </p>
            </div>

            <Separator />

            <div className="px-4 py-5 sm:px-6">
              <div className="terminal p-4 text-sm mb-4 h-80 overflow-y-auto">
                {terminalOutput.map((item, index) => (
                  <div key={index}>
                    {item.type === "command" && (
                      <div className="terminal-line mb-2">
                        <span className="terminal-prompt">{item.content}</span>
                      </div>
                    )}
                    {item.type === "output" && (
                      <div className="terminal-output mb-4">
                        {Array.isArray(item.content) &&
                          item.content.map((line, lineIndex) => (
                            <div
                              key={lineIndex}
                              className={
                                item.status === "success" &&
                                lineIndex === item.content.length - 1
                                  ? "terminal-success"
                                  : item.status === "warning" &&
                                      lineIndex === item.content.length - 1
                                    ? "terminal-warning"
                                    : item.status === "error" &&
                                        lineIndex === item.content.length - 1
                                      ? "terminal-error"
                                      : ""
                              }
                            >
                              {line}
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <div className="flex-1">
                  <Input
                    type="text"
                    placeholder="Enter command"
                    value={command}
                    onChange={(e) => setCommand(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleRunCommand()}
                  />
                </div>
                <Button onClick={handleRunCommand}>Run</Button>
                <Button variant="outline" onClick={handleClearTerminal}>
                  Clear
                </Button>
              </div>
            </div>
          </Card>

          {/* Navigation Controls */}
          <div className="mt-8 flex justify-between">
            <Button
              variant="outline"
              onClick={handlePreviousStep}
              className="flex items-center"
            >
              <ArrowLeft className="-ml-1 mr-2 h-5 w-5 text-gray-500" />
              Previous Step
            </Button>
            <Button onClick={handleNextStep} className="flex items-center">
              Next Step
              <ArrowRight className="ml-2 -mr-1 h-5 w-5" />
            </Button>
          </div>
        </div>
      </main>

      <footer className="bg-white">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-500">
            Project Setup Assistant • Version 1.0.0
          </p>
        </div>
      </footer>
    </div>
  );
}
