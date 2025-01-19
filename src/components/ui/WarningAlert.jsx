import { AlertTriangle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "./alert";


export default function WarningAlert({ title, message }) {
  return (
    <Alert variant="destructive" className="w-full rounded-lg border-yellow-500 bg-yellow-50 text-yellow-900 flex items-center mx-2">
      <div className="flex items-center">
        <AlertTriangle className="h-5 w-5 text-yellow-500 mr-4" />
        <div>
          <AlertTitle className="text-yellow-900">{title}</AlertTitle>
          <AlertDescription className="text-yellow-800">
            {message}
          </AlertDescription>
        </div>
      </div>
    </Alert>
  )
}

