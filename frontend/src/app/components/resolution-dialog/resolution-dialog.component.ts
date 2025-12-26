import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

export interface ResolutionDialogData {
    previousNotes: string;
}

@Component({
    selector: 'app-resolution-dialog',
    templateUrl: './resolution-dialog.component.html',
    styleUrls: ['./resolution-dialog.component.css']
})
export class ResolutionDialogComponent {
    resolutionForm: FormGroup;
    previousNotes: string;

    constructor(
        public dialogRef: MatDialogRef<ResolutionDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: ResolutionDialogData,
        private fb: FormBuilder
    ) {
        this.previousNotes = data.previousNotes || '';
        this.resolutionForm = this.fb.group({
            workPerformed: ['', [Validators.required, Validators.minLength(10)]],
            observations: ['', Validators.required],
            resolutionSummary: ['', Validators.required]
        });
    }

    onCancel(): void {
        this.dialogRef.close();
    }

    onSubmit(): void {
        if (this.resolutionForm.valid) {
            const formValue = this.resolutionForm.value;
            const timestamp = new Date().toLocaleString();

            const newNote = `
[${timestamp}]
Work Performed: ${formValue.workPerformed}
Observations: ${formValue.observations}
Resolution Summary: ${formValue.resolutionSummary}
----------------------------------------`;

            this.dialogRef.close(newNote);
        }
    }
}
