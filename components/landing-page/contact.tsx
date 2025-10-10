import { Button } from '@/components/ui/button';
import { contactContent } from '@/config/landing-page';

export default function Contact() {
  return (
    <div className="max-w-[90vw] bg-slate-50 dark:bg-transparent text-primary rounded-6xl p-12 md:p-16 mx-auto mb-12">
      <div className="max-w-[50vw] p-16 ml-20">
        <div className="my-10">
          <h2 className="text-3xl md:text-4xl font-semibold mb-4">
            {contactContent.heading}
          </h2>
          <Button className="bg-primary text-secondary rounded-full px-6 py-2">
            {contactContent.cta.text}
          </Button>
        </div>
        <hr className="border-t border-gray-700 my-10" />
        <div className="my-4">
          <h3 className="text-xl font-semibold mb-2">{contactContent.offices.heading}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 ">
            {contactContent.offices.locations.map((location, index) => (
              <div key={index}>
                <div className="mb-4">
                  <h4 className="text-lg font-semibold">{location.city}</h4>
                  {location.address.map((line, lineIndex) => (
                    <p key={lineIndex} className="font-light">{line}</p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
